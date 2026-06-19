```text
================================================================================
          O
         /|\      "WELCOME TO THE MOST HARDCORE PRINT SERVER"
         / \
    ____       _       __       __          __         __
   / __ \_____(_)___  / /_     / /   ____ _/ /_  ___  / / 
  / /_/ / ___/ / __ \/ __/    / /   / __ `/ __ \/ _ \/ /  
 / ____/ /  / / / / / /_     / /___/ /_/ / /_/ /  __/ /   
/_/   /_/  /_/_/ /_/\__/    /_____/\__,_/_.___/\___/_/    
                                                          
   _____                                                  
  / ___/___  ______   _____  _____                        
  \__ \/ _ \/ ___/ | / / _ \/ ___/                        
 ___/ /  __/ /   | |/ /  __/ /                            
/____/\___/_/    |___/\___/_/                             
================================================================================
     O>>         O>>         O>>         O>>         O>>         O>>     
    //          //          //          //          //          //       
  __)\_       __)\_       __)\_       __)\_       __)\_       __)\_      
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     _
    / \
   |   |   [!] A high-performance, intelligent Flask server for dynamic
   |   |       label printing with Brother QL printers.
   |   |
  /     \
 |_______|
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                [ ARCHITECTURE ]

                       [ FLASK SERVER RACK ]
                        _________________
                       |  _ _ _ _ _ _ _  |
   _,,--,,_            | | | | | | | | | |            "I BRING THE DATA!"
  / o  o   \           | | | | | | | | | |                \
  \  __   _/           | | | | | | | | | |      +-----------------+
   |    |        --->  |                 |<---  | [ DDG SCRAPER ] |
 +---------------+     | [====>  <====]  |      | Background      |
 | [ INVENTORY ] |     |  O O O O O O O  |      | Rate-limit      |
 | CSV / Excel   |     |_________________|      +-----------------+
 |  _______      |             |
 | |       |     |             |
 | |___o___|     |             v                  o
 +---------------+    +------------------+       /|\
                      |  brother_ql API  |       / \
                      |  Rasterization   |
                      |  python-barcode  |
                      +------------------+
                               |                  
                               v                 
                        _________________        
                       /                 \       
                      |  [ BROTHER QL ]   |      
         ()           |   _   _   _   _   |      
         )(           |  |_| |_| |_| |_|  |      
      o======o        |___________________|      
         ||            \                 /       
         ||             ====[ LABEL ]====        
         ||              | |||| | ||| |          
         ||              | |||| | ||| |          
         ||              ==============          
         \/                 

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                 [ FEATURES ]

 +-------------------------------------------------------------+
 | MODULE               | DESCRIPTION                          |
 |----------------------|--------------------------------------|
 | [Crawler]            | Asynchronous background daemon       |
 |    /\_/\             | parsing DuckDuckGo images for        |
 |   ( o.o )            | local caching.                       |
 |    > ^ <             |                                      |
 |                      |                                      |
 | [Dynamic Templates]  | Visually build, save, and deploy     |
 |   .--------.         | variable-data label layouts via      |
 |  /        /|         | the web UI.                          |
 | '--------' |         |                                      |
 | |        | /         |                                      |
 | '--------'           |                                      |
 |                      |                                      |
 | [Socket Protocol]    | Zero-driver deployment. Native       |
 |     (())             | rasterization piped directly over    |
 |    .-||-.            | TCP/IP (Port 9100).                  |
 |                      |                                      |
 | [Inventory Sync]     | Turn-key ingestion of Square         |
 |      __              | Point-of-Sale exports and            |
 |   __|__|__           | standard spreadsheets.               |
 |  |        |          |                                      |
 |  |________|          |                                      |
 +-------------------------------------------------------------+
                                       (>'-'<) "We love features!"
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                    [ API ]

      /^\ 
     /   \     *    <-- "I am the Magic API Wizard. Look at my spells below."
    /___\_\   /
   ( o . o ) /
    \  _  / /
     \_-_/ /
   /  | |  \
  |   |_|   |

 GET  /api/items           -> Retrieve current loaded inventory list.
 POST /api/print           -> Submit a dynamic print job containing item arrays.
 POST /api/config          -> Update target Brother printer IP address.
 GET  /api/scrape/status   -> Monitor the background image crawler throughput.
 POST /api/scrape/toggle   -> Manually start/stop the crawler thread.
 POST /api/upload          -> Ingest new inventory CSV/Excel files.

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                [ FILE SYSTEM ]

 .
 |-- Print-label-server/
 |   |-- data/                 # Volatile / Persistent storage
 |   |   |-- config.json       # Target printer configuration
 |   |   |-- image_cache.json  # Cached DDG thumbnails
 |   |   |-- inventory.json    # Serialized spreadsheet data
 |   |   `-- templates.json    # User-defined label layouts
 |   |-- static/               # Client-side compiled assets
 |   |-- templates/            # Flask Jinja2 render files
 |   |-- venv/                 # Local Python environment
 |   |-- app.py                # Primary Application Daemon
 |   `-- requirements.txt      # Dependency manifest

        .--.
       |o_o |   <-- "I'm watching your files... beep boop."
       |:_/ |
      //   \ \
     (|     | )
    /'\_   _/`\
    \___)=(___/

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                 [ INSTALL ]
           \||/
           |  @___oo
 /\  /\   / (__,,,,|  <-- "A dragon guards the installation! BEWARE!"
) /^\) ^\/ _)
)   /^\/   _)
)_ /  /    _)
 /\  / \   _)

 [01] Clone the repository
      $ git clone https://github.com/CalvinistKlein/Print-label-server.git
      $ cd Print-label-server

 [02] Initialize isolated virtual environment
      $ python3 -m venv venv
      $ source venv/bin/activate

 [03] Install system dependencies
      $ pip install -r requirements.txt

 [04] Boot the server daemon
      $ python app.py
      > Server will bind to http://0.0.0.0:5000

================================================================================
   _____ _    _  _____ _____ 
  / ____| |  | |/ ____/ ____|
 | (___ | |  | | |   | |     
  \___ \| |  | | |   | |     
  ____) | |__| | |___| |____ 
 |_____/ \____/ \_____\_____|
================================================================================
```
