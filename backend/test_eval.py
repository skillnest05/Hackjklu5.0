import sys
import json
sys.path.append('.')
from services.evaluator import evaluate_essay

test_essay = "I believe students should definitely wear uniforms. Firstly, they reduce peer pressure and bullying over expensive clothes. For example, a study by Harvard showed that schools with uniforms had 30% fewer discipline issues. Moreover, uniforms save parents money because they do not have to buy as many brand-name outfits. Therefore, uniforms create a more equal environment."
test_prompt = "Should students wear uniforms?"

try:
    result = evaluate_essay(test_essay, test_prompt)
    print("Success")
    print(json.dumps(result["argument_map"], indent=2))
except Exception as e:
    import traceback
    traceback.print_exc()
