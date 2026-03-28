from app.agents.master_editor import app_graph

def test_drive():
    inputs = {
        "query": "Give me a deep briefing on Reliance ",
        "persona": "Investor",
        "language": "Hindi"
    }
    
    print("Running Agent...")
    config = {"configurable": {"thread_id": "1"}}
    for output in app_graph.stream(inputs, config):
        for key, value in output.items():
            print(f"\n--- Output from Node '{key}' ---")
            print(value['final_output'])

if __name__ == "__main__":
    test_drive()