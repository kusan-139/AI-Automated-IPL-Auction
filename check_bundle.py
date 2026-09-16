import urllib.request
import re

try:
    html = urllib.request.urlopen('https://ai-automated-ipl-auction-54oz.vercel.app').read().decode('utf-8')
    match = re.search(r'src="(/assets/index-[^"]+\.js)"', html)
    if match:
        js_url = 'https://ai-automated-ipl-auction-54oz.vercel.app' + match.group(1)
        js = urllib.request.urlopen(js_url).read().decode('utf-8')
        if 'ai-automated-ipl-auction-production.up.railway.app' in js:
            print("API URL is inside the Vercel bundle!")
            if '/api/v1' in js:
                print("And it has the /api/v1 suffix!")
            else:
                print("But it is MISSING the /api/v1 suffix!")
        else:
            print("API URL is NOT in the bundle. It's using localhost.")
    else:
        print("Could not find JS bundle")
except Exception as e:
    print("Error:", e)
