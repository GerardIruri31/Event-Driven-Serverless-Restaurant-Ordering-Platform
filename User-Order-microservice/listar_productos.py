import boto3
import os
from validate_token import validate_token

dynamodb = boto3.resource('dynamodb')

def listar_productos(event, context):
    token_validation = validate_token(event, context)
    if token_validation['statusCode'] != 200:
        return token_validation

    tipo = event["queryStringParameters"].get("tipo")
    if not tipo:
        return {
            'statusCode': 400,
            'body': 'Debes enviar ?tipo=pizza'
        }

    table = dynamodb.Table(os.environ["DYNAMODB_TABLE_PRODUCTOS"])

    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("tenant_id").eq(tipo)
    )

    return {
        'statusCode': 200,
        'body': response["Items"]
    }
