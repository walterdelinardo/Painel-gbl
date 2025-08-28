
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='admin')

    def __repr__(self):
        return f'<User {self.username}>'

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    contact_person = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    cnpj = db.Column(db.String(20), nullable=True)
    observations = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # NOVO: Adicionado backref e cascade para deleção de pedidos
    orders = db.relationship('Order', backref='client', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Client {self.name}>'

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    material = db.Column(db.String(100), nullable=False)
    thickness = db.Column(db.String(20), nullable=False)
    width = db.Column(db.Float, nullable=False)
    length = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    observations = db.Column(db.Text, nullable=True)
    value = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Aguardando')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # A linha abaixo foi removida pois o backref foi movido para o modelo Client
    # client = db.relationship('Client', backref=db.backref('orders', lazy=True))

    def __repr__(self):
        return f'<Order {self.order_number}>'

# MODELO: Product
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=True)
    sku = db.Column(db.String(50), unique=True, nullable=True)
    stock = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Product {self.name}>'
