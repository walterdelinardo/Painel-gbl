from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from database import db, User, Client, Order, Product
import io
import csv
from datetime import datetime
from sqlalchemy import func, extract
from werkzeug.security import generate_password_hash, check_password_hash
from fpdf import FPDF

app = Flask(__name__)

# String de conexão do banco de dados corrigida com usuário, senha e porta
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://bwqQCWau3ybME2RR:6XHFzssSRgbjzIMUZat3i557497Zcr38@localhost:5433/gbl"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)

# --- Rotas de Autenticação ---
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login bem-sucedido!", "user": {"username": user.username, "role": user.role}}), 200
    return jsonify({"message": "Credenciais inválidas"}), 401

# --- Rotas de Clientes ---
@app.route("/api/clients", methods=["GET"])
def get_clients():
    clients = Client.query.all()
    # CORREÇÃO: Sintaxe do jsonify corrigida
    return jsonify([{
        "id": c.id, "name": c.name, "contact_person": c.contact_person,
        "phone": c.phone, "email": c.email, "address": c.address,
        "cnpj": c.cnpj, "observations": c.observations,
        "created_at": c.created_at.isoformat() if c.created_at else None
    } for c in clients])

@app.route("/api/clients", methods=["POST"])
def add_client():
    data = request.get_json()
    if not data.get("name"):
        return jsonify({"message": "Nome do cliente é obrigatório"}), 400
    new_client = Client(
        name=data["name"], contact_person=data.get("contact_person"),
        phone=data.get("phone"), email=data.get("email"),
        address=data.get("address"), cnpj=data.get("cnpj"),
        observations=data.get("observations")
    )
    try:
        db.session.add(new_client)
        db.session.commit()
        return jsonify({"message": "Cliente adicionado com sucesso!", "client": {
            "id": new_client.id, "name": new_client.name, "contact_person": new_client.contact_person,
            "phone": new_client.phone, "email": new_client.email, "address": new_client.address,
            "cnpj": new_client.cnpj, "observations": new_client.observations,
            "created_at": new_client.created_at.isoformat()
        }}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao adicionar cliente: {str(e)}"}), 500

@app.route("/api/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"message": "Cliente não encontrado"}), 404
    data = request.get_json()
    try:
        client.name = data.get("name", client.name)
        client.contact_person = data.get("contact_person", client.contact_person)
        client.phone = data.get("phone", client.phone)
        client.email = data.get("email", client.email)
        client.address = data.get("address", client.address)
        client.cnpj = data.get("cnpj", client.cnpj)
        client.observations = data.get("observations", client.observations)
        db.session.commit()
        return jsonify({"message": "Cliente atualizado com sucesso!", "client": {
            "id": client.id, "name": client.name, "contact_person": client.contact_person,
            "phone": client.phone, "email": client.email, "address": client.address,
            "cnpj": client.cnpj, "observations": client.observations,
            "created_at": client.created_at.isoformat()
        }}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao atualizar cliente: {str(e)}"}), 500

@app.route("/api/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"message": "Cliente não encontrado"}), 404
    try:
        # Lógica de deleção em cascata (comentada pois o backref em database.py já lida com isso)
        # orders_to_delete = Order.query.filter_by(client_id=client_id).all()
        # for order in orders_to_delete:
        #     db.session.delete(order)
        db.session.delete(client)
        db.session.commit()
        return jsonify({"message": "Cliente deletado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao deletar cliente: {str(e)}"}), 500

@app.route('/api/clients/export', methods=['GET'])
def export_clients():
    try:
        clients = Client.query.all()
        output = io.StringIO()
        writer = csv.writer(output)
        headers = ['ID', 'Nome', 'Pessoa de Contato', 'Telefone', 'Email', 'Endereço', 'CNPJ', 'Observações', 'Criado Em']
        writer.writerow(headers)
        for client in clients:
            writer.writerow([
                client.id, client.name, client.contact_person, client.phone, client.email,
                client.address, client.cnpj, client.observations,
                client.created_at.isoformat() if client.created_at else ''
            ])
        csv_data = output.getvalue()
        output.close()
        return send_file(
            io.BytesIO(csv_data.encode('utf-8')), mimetype='text/csv', as_attachment=True,
            download_name=f'clientes_exportados_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
    except Exception as e:
        return jsonify({'message': f'Erro ao exportar clientes: {str(e)}'}), 500

@app.route('/api/clients/import', methods=['POST'])
def import_clients():
    if 'file' not in request.files: return jsonify({'message': 'Nenhum arquivo enviado'}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({'message': 'Nenhum arquivo selecionado'}), 400
    if not file.filename.endswith('.csv'): return jsonify({'message': 'Formato de arquivo inválido. Apenas CSV é permitido.'}), 400
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"))
        reader = csv.reader(stream)
        header = next(reader, None)
        if not header: return jsonify({'message': 'Arquivo CSV vazio ou sem cabeçalho'}), 400
        column_mapping = {
            'ID': 'id', 'Nome': 'name', 'Pessoa de Contato': 'contact_person',
            'Telefone': 'phone', 'Email': 'email', 'Endereço': 'address',
            'CNPJ': 'cnpj', 'Observações': 'observations', 'Criado Em': 'created_at'
        }
        mapped_indices = {col_name: header.index(csv_header) for csv_header, col_name in column_mapping.items() if csv_header in header}
        imported_count = 0; updated_count = 0; errors = []
        for row_num, row in enumerate(reader):
            if not row: continue
            client_data = {};
            for model_col, idx in mapped_indices.items():
                if idx < len(row): client_data[model_col] = row[idx]
            for key in ['contact_person', 'email', 'phone', 'address', 'cnpj', 'observations']:
                if key not in client_data or client_data[key] == '': client_data[key] = None
            if 'created_at' in client_data and client_data['created_at']:
                try: client_data['created_at'] = datetime.fromisoformat(client_data['created_at'])
                except ValueError: errors.append(f"Linha {row_num + 2}: Formato de data inválido para 'Criado Em'."); continue
            existing_client = None
            if 'id' in client_data and client_data['id']:
                try: existing_client = Client.query.get(int(client_data['id']))
                except ValueError: errors.append(f"Linha {row_num + 2}: ID inválido '{client_data['id']}'."); continue
            if not existing_client and 'name' in client_data and client_data['name']:
                existing_client = Client.query.filter_by(name=client_data['name']).first()
            if existing_client:
                for key, value in client_data.items():
                    if key != 'id': setattr(existing_client, key, value)
                updated_count += 1
            else:
                if 'id' in client_data: del client_data['id']
                if not client_data.get('name'): errors.append(f"Linha {row_num + 2}: Nome do cliente é obrigatório e não fornecido."); continue
                new_client = Client(**client_data)
                db.session.add(new_client)
                imported_count += 1
        db.session.commit()
        response_message = f"Importação concluída. Novos clientes: {imported_count}, Clientes atualizados: {updated_count}."
        if errors: response_message += f" Erros encontrados: {len(errors)}. Verifique os logs para detalhes."; print("Erros de importação:", errors)
        return jsonify({'message': response_message, 'errors': errors}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro inesperado durante a importação: {str(e)}")
        return jsonify({'message': f'Erro inesperado durante a importação: {str(e)}'}), 500

# --- Rotas de Produtos ---
@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([{
        "id": p.id, "name": p.name, "description": p.description,
        "price": p.price, "unit": p.unit, "sku": p.sku,
        "stock": p.stock,
        "created_at": p.created_at.isoformat() if p.created_at else None
    } for p in products])

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json()
    if not data.get("name") or not data.get("price"):
        return jsonify({"message": "Nome e preço do produto são obrigatórios"}), 400
    try:
        new_product = Product(
            name=data["name"], description=data.get("description"),
            price=float(str(data["price"]).replace(',', '.')),
            unit=data.get("unit"), sku=data.get("sku"),
            stock=int(data.get("stock", 0))
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Produto adicionado com sucesso!", "product": {
            "id": new_product.id, "name": new_product.name, "description": new_product.description,
            "price": new_product.price, "unit": new_product.unit, "sku": new_product.sku,
            "stock": new_product.stock,
            "created_at": new_product.created_at.isoformat()
        }}), 201
    except ValueError:
        db.session.rollback()
        return jsonify({"message": "Formato de preço ou estoque inválido."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao adicionar produto: {str(e)}"}), 500

@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Produto não encontrado"}), 404
    data = request.get_json()
    try:
        product.name = data.get("name", product.name)
        product.description = data.get("description", product.description)
        if "price" in data:
            product.price = float(str(data["price"]).replace(',', '.'))
        product.unit = data.get("unit", product.unit)
        product.sku = data.get("sku", product.sku)
        if "stock" in data:
            product.stock = int(data["stock"])
        db.session.commit()
        return jsonify({"message": "Produto atualizado com sucesso!", "product": {
            "id": product.id, "name": product.name, "description": product.description,
            "price": product.price, "unit": product.unit, "sku": product.sku,
            "stock": product.stock,
            "created_at": product.created_at.isoformat()
        }}), 200
    except ValueError:
        db.session.rollback()
        return jsonify({"message": "Formato de preço ou estoque inválido."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao atualizar produto: {str(e)}"}), 500

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Produto não encontrado"}), 404
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Produto deletado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao deletar produto: {str(e)}"}), 500

@app.route('/api/products/import', methods=['POST'])
def import_products():
    if 'file' not in request.files: return jsonify({'message': 'Nenhum arquivo enviado'}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({'message': 'Nenhum arquivo selecionado'}), 400
    if not file.filename.endswith('.csv'): return jsonify({'message': 'Formato de arquivo inválido. Apenas CSV é permitido.'}), 400
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"))
        reader = csv.reader(stream)
        header = next(reader, None)
        if not header: return jsonify({'message': 'Arquivo CSV vazio ou sem cabeçalho'}), 400
        
        column_mapping = {
            'ID': 'id', 'Nome': 'name', 'Descrição': 'description',
            'Preço': 'price', 'Unidade': 'unit', 'SKU': 'sku',
            'Estoque': 'stock',
            'Criado Em': 'created_at'
        }

        mapped_indices = {col_name: header.index(csv_header) for csv_header, col_name in column_mapping.items() if csv_header in header}
        imported_count = 0; updated_count = 0; errors = []
        for row_num, row in enumerate(reader):
            if not row: continue
            product_data = {};
            for model_col, idx in mapped_indices.items():
                if idx < len(row): product_data[model_col] = row[idx]
            
            for key in ['description', 'unit', 'sku']:
                if key not in product_data or product_data[key] == '': product_data[key] = None

            if 'price' in product_data and product_data['price']:
                try: product_data['price'] = float(str(product_data['price']).replace(',', '.'))
                except ValueError: errors.append(f"Linha {row_num + 2}: Formato de preço inválido para '{product_data['price']}'."); continue
            else: errors.append(f"Linha {row_num + 2}: Preço é obrigatório e não fornecido."); continue

            if 'stock' in product_data and product_data['stock']:
                try: product_data['stock'] = int(product_data['stock'])
                except ValueError: errors.append(f"Linha {row_num + 2}: Formato de estoque inválido para '{product_data['stock']}'."); continue
            else: product_data['stock'] = 0

            if 'created_at' in product_data and product_data['created_at']:
                try: product_data['created_at'] = datetime.fromisoformat(product_data['created_at'])
                except ValueError: errors.append(f"Linha {row_num + 2}: Formato de data inválido para 'Criado Em'."); continue

            existing_product = None
            if 'id' in product_data and product_data['id']:
                try: existing_product = Product.query.get(int(product_data['id']))
                except ValueError: errors.append(f"Linha {row_num + 2}: ID inválido '{product_data['id']}'."); continue
            
            if not existing_product and 'name' in product_data and product_data['name']:
                existing_product = Product.query.filter_by(name=product_data['name']).first()

            if existing_product:
                for key, value in product_data.items():
                    if key != 'id': setattr(existing_product, key, value)
                updated_count += 1
            else:
                if 'id' in product_data: del product_data['id']
                if not product_data.get('name'): errors.append(f"Linha {row_num + 2}: Nome do produto é obrigatório e não fornecido."); continue
                new_product = Product(**product_data)
                db.session.add(new_product)
                imported_count += 1
        
        db.session.commit()
        
        response_message = f"Importação de produtos concluída. Novos produtos: {imported_count}, Produtos atualizados: {updated_count}."
        if errors: response_message += f" Erros encontrados: {len(errors)}. Verifique os logs para detalhes."; print("Erros de importação de produtos:", errors)
        return jsonify({'message': response_message, 'errors': errors}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro inesperado durante a importação de produtos: {str(e)}")
        return jsonify({'message': f'Erro inesperado durante a importação: {str(e)}'}), 500

# --- Rotas de Pedidos ---
@app.route("/api/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        "id": o.id, "order_number": o.order_number, "client_id": o.client_id,
        "material": o.material, "thickness": o.thickness, "width": o.width,
        "length": o.length, "quantity": o.quantity, "observations": o.observations,
        "value": o.value, "status": o.status, "created_at": o.created_at.isoformat()
    } for o in orders])

# Rota para obter dados de vendas/pedidos por mês para gráficos
@app.route("/api/dashboard/sales_by_month", methods=["GET"])
def get_sales_by_month():
    try:
        sales_data = db.session.query(
            extract('year', Order.created_at).label('year'),
            extract('month', Order.created_at).label('month'),
            func.sum(Order.value).label('total_value'),
            func.count(Order.id).label('total_orders')
        ).group_by('year', 'month').order_by('year', 'month').all()

        result = []
        for row in sales_data:
            month_str = f"{int(row.month):02d}"
            label = datetime(int(row.year), int(row.month), 1).strftime('%b/%y')
            result.append({
                "month_year": f"{int(row.year)}-{month_str}", "label": label,
                "total_value": float(row.total_value) if row.total_value else 0,
                "total_orders": int(row.total_orders) if row.total_orders else 0
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"Erro ao buscar dados de vendas por mês: {str(e)}")
        return jsonify({"message": f"Erro ao buscar dados de vendas por mês: {str(e)}"}), 500

# Rota para obter produtos com estoque baixo
@app.route("/api/dashboard/low_stock_products", methods=["GET"])
def get_low_stock_products():
    LOW_STOCK_THRESHOLD = 10 
    try:
        low_stock_products = Product.query.filter(Product.stock <= LOW_STOCK_THRESHOLD).all()
        return jsonify([{
            "id": p.id, "name": p.name, "sku": p.sku, "stock": p.stock, "unit": p.unit
        } for p in low_stock_products]), 200
    except Exception as e:
        print(f"Erro ao buscar produtos com estoque baixo: {str(e)}")
        return jsonify({"message": f"Erro ao buscar produtos com estoque baixo: {str(e)}"}), 500

# --- Rotas de Usuários ---
@app.route("/api/users", methods=["GET"])
def get_users():
    try:
        users = User.query.all()
        return jsonify([{
            "id": u.id,
            "username": u.username,
            "role": u.role
        } for u in users]), 200
    except Exception as e:
        print(f"Erro ao buscar usuários: {str(e)}")
        return jsonify({"message": f"Erro ao buscar usuários: {str(e)}"}), 500

@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user") # Padrão para 'user' se não especificado

    if not username or not password:
        return jsonify({"message": "Nome de usuário e senha são obrigatórios"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Nome de usuário já existe"}), 409 # Conflict

    try:
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuário adicionado com sucesso!", "user": {
            "id": new_user.id, "username": new_user.username, "role": new_user.role
        }}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao adicionar usuário: {str(e)}")
        return jsonify({"message": f"Erro ao adicionar usuário: {str(e)}"}), 500

@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuário não encontrado"}), 404
    
    data = request.get_json()
    try:
        if "username" in data and data["username"] != user.username:
            if User.query.filter_by(username=data["username"]).first():
                return jsonify({"message": "Nome de usuário já existe"}), 409
            user.username = data["username"]
        
        if "password" in data and data["password"]: # Apenas atualiza se uma nova senha for fornecida
            user.password = generate_password_hash(data["password"])
        
        if "role" in data:
            user.role = data["role"]
            
        db.session.commit()
        return jsonify({"message": "Usuário atualizado com sucesso!", "user": {
            "id": user.id, "username": user.username, "role": user.role
        }}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar usuário: {str(e)}")
        return jsonify({"message": f"Erro ao atualizar usuário: {str(e)}"}), 500

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "Usuário não encontrado"}), 404
    
    # Prevenção: não permitir deletar o último admin
    if user.role == 'admin' and User.query.filter_by(role='admin').count() == 1:
        return jsonify({"message": "Não é possível deletar o último usuário administrador"}), 403 # Forbidden

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Usuário deletado com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao deletar usuário: {str(e)}"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
