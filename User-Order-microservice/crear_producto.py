import boto3
import uuid
import base64
import os
from datetime import datetime
from validate_token import validate_token  # reutilizamos tu función

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def upload_image(base64_data, filename):
    bucket = os.environ['BUCKET_IMAGENES_PRODUCTOS']
    binary = base64.b64decode(base64_data)
    
    s3.put_object(
        Bucket=bucket,
        Key=filename,
        Body=binary,
        ContentType="image/jpeg"
    )

    return f"https://{bucket}.s3.amazonaws.com/{filename}"

def crear_producto(event, context):
    # Validación de token
    token_validation = validate_token(event, context)
    if token_validation['statusCode'] != 200:
        return token_validation
    
    body = event['body']
    nombre = body.get('nombre')
    tipo = body.get('tipo')  # <- será tenant_id
    precio = body.get('precio')
    promo = body.get('promo', False)
    imagen_small = body.get('imagen_small')
    imagen_large = body.get('imagen_large')

    if not nombre or not tipo or not precio or not imagen_small or not imagen_large:
        return {
            'statusCode': 400,
            'body': 'Faltan datos'
        }

    product_id = str(uuid.uuid4())
    promo_id = f"{uuid.uuid4()}#FoT" if promo else "NO_PROMO"

    # Crear nombres de archivos S3
    filename_small = f"{tipo}/{product_id}_small.jpg"
    filename_large = f"{tipo}/{product_id}_large.jpg"

    # Guardar imágenes
    url_small = upload_image(imagen_small, filename_small)
    url_large = upload_image(imagen_large, filename_large)

    # Guardar en DynamoDB
    table = dynamodb.Table(os.environ["DYNAMODB_TABLE_PRODUCTOS"])
    table.put_item(
        Item={
            "tenant_id": tipo,
            "product_id": product_id,
            "nombre": nombre,
            "precio": precio,
            "promo_id": promo_id,
            "url_small": url_small,
            "url_large": url_large,
            "creado": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    )

    return {
        'statusCode': 200,
        'body': {
            "message": "Producto creado",
            "product_id": product_id,
            "url_small": url_small,
            "url_large": url_large
        }
    }
