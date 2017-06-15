import requests

token = check_output(tokenOK.py)

print token

random_op = 'visa ' + str(int(time.time()))

url = "http://localhost:19002/payments"

payload = "{\n\t\"user_id\": \"morton\",\n   \"site_transaction_id\": \"" + random_op + "\",\n   \"token\": \"" + token + "\",\n   \"payment_method_id\": 1,\n   \"bin\": \"450799\",\n   \"amount\": 20000,\n   \"currency\": \"ARS\",\n   \"installments\": 1,\n   \"description\": \"Prueba QA\",\n   \"payment_type\": \"single\",\n   \"establishment_name\" : \"prueba desa soft\",\n   \"sub_payments\": [\n   \t]\n   \n}"
headers = {
    'content-type': "application/json",
    'apikey': "660b244e41bf404b821789c0113c6337",
    'cache-control': "no-cache",
    'postman-token': "7cd98264-18dc-874f-b587-995e836623a8"
    }

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)
