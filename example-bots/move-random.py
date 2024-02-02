import requests
import random
import time


while True:
    random_move = random.choice(['up', 'down', 'left','right'])

    print(f"moving {random_move}")
    requests.post('https://api-ratmaze.jackp.me/move', json={'direction': random_move}, headers={'Content-Type': 'application/json', 'Authorization': f"Bearer python-bot"})
    time.sleep(.5)