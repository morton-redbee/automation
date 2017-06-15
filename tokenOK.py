import requests

url = "http://localhost:19002/tokens"

payload = "{\n\t\"card_number\" : \"4507990000004905\",\n    \"card_expiration_month\" : \"07\",\n    \"card_expiration_year\" : \"17\", \n    \"security_code\" : \"234\",\n    \"card_holder_name\" : \"Valentin Santiago Gomez\",\n    \"card_holder_identification\" : {\n       \"type\" : \"dni\",\n       \"number\" : \"23968498\"\n    },\n    \"fraud_detection\" : {\n        \"device_unique_identifier\": \"12345\"\n    }\n}"
headers = {
    'content-type': "application/json",
    'apikey': "d90e474470dc45788d888bc8e4a789e7",
    'cache-control': "no-cache",
    'postman-token': "013774fb-4cbb-6d5b-7d7c-877e4701aecc"
    }

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)
