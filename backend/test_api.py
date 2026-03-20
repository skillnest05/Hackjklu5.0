import requests
import json

url = "http://localhost:8000/api/evaluate"
payload = {
    "essay_text": "I believe students should definitely wear uniforms. Firstly, they reduce peer pressure and bullying over expensive clothes. For example, a study by Harvard showed that schools with uniforms had 30% fewer discipline issues. Moreover, uniforms save parents money because they do not have to buy as many brand-name outfits. Therefore, uniforms create a more equal environment.",
    "prompt": "Should students wear uniforms?"
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
