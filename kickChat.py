import time;
import datetime;
import json;
from selenium import webdriver;
from selenium.webdriver.firefox.options import Options;
from selenium.webdriver.common.by import By;
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
import threading

############################################################# CONSTANTS & CONTROL VARIABLES #############################################################
channel_name='';
channel_id_url='https://kick.com/api/v2/channels/' +channel_name;
chat_url="";
debug=True;
http_server_address='localhost:8000';
running=True;
chat_json="";
channel_id_json="";

############################################################# UTILITY #############################################################
def log(msg,source='MAIN',sameline=False):   
    if isinstance(msg,list) or isinstance(msg,tuple):
        message= str(datetime.datetime.now() ) + ' || ' + source + ' || ' + str(msg)
    else:   
        message= str(datetime.datetime.now() ) + ' || ' + source + ' || ' + msg
    if len(message) > 1000:
        message = str(datetime.datetime.now() ) + ' || ' + source + ' || ' +'Message too long '
    if debug :
        if sameline:
            print (message,end = '')
        else:
            print (message)
############################################################# WEBSCRAPING #############################################################
def webdriver_init():
    log("Webscraping Init .... ");
    options = Options();
    options.add_argument('--headless');
    driver = webdriver.Firefox(options=options);
    return driver;

def webdriver_scrape_chat(webdriver):
    log(" Getting data from " + chat_url);
    webdriver.get(chat_url);
    #print(webdriver.page_source);
    body=webdriver.find_element(By.XPATH, "//body").get_attribute('innerHTML');
    
    global chat_json;
    chat_json=body;
    #print(chat_json);

def webdriver_scrape_channel_id(webdriver):
    log(" Getting data from " + channel_id_url);
    webdriver.get(channel_id_url);
    #print(webdriver.page_source);
    body=webdriver.find_element(By.XPATH, "//body").get_attribute('innerHTML');
    #log(body,'SCRP');
    global channel_id_json,chat_url;
    channel_id_json=body;
    channel_id=json.loads(channel_id_json)["id"];
    chat_url='https://kick.com/api/v2/channels/'+str(channel_id)+'/messages';

############################################################# HTML SERVER #############################################################
class httpServer(BaseHTTPRequestHandler):
    def do_GET(self):
        global chat_json,channel_id_json;
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        #self.wfile.write(bytes("<html><head><title>Python twitch bot %s </title></head>" %self.path[1:], "utf-8"))
        #self.wfile.write(bytes("<body>", "utf-8"))
        if self.path.find('messages')>=0 and chat_json != '' :
            self.wfile.write(bytes(chat_json, "utf-8"));
        elif channel_id_json != "": 
            self.wfile.write(bytes(channel_id_json, "utf-8"));
        #self.wfile.write(bytes("</body></html>", "utf-8")) 

def html_init():
    
    http_server_addresss=http_server_address[:http_server_address.index(':')]
    http_server_port=int(http_server_address[http_server_address.index(':')+1:])
    http_server = HTTPServer((http_server_addresss, http_server_port), httpServer)
    
    log("HTTP Server started @http://" + http_server_address +':' + str(http_server_port), 'HTTP' )
    return http_server  

def html_end():
    log("HTTP Server stopped", 'HTTP' )


def html_main():
	
    http_server=html_init()
    global running;  
    while (running):
        # TBD : do not print HTML requests on debug or print better
        # TBD : stop html server with exit command without any request to be sent to server
        #http_server.serve_forever()
        http_server.handle_request();
    http_server.server_close()
    
    
    html_end()

############################################################# INIT & END #############################################################
def init():
    log("KICK chat scraping Init .... ");
    return webdriver_init();


def end(webdriver):
    log("KICK chat scraping Closing .... ");
    running=False;
    try:
        webdriver.close();
    except:
        a=True;
    

############################################################# MAINLOOP #############################################################

def main():
    webdriver=init();
    
    while True:
        try:           
            webdriver_scrape_channel_id(webdriver);
            webdriver_scrape_chat(webdriver);
            
            time.sleep(0.5);
        except:
            log("Exception caught");
            break;

    end(webdriver);


if channel_name != "" :

    main_thread=Thread(name='MAIN',target=main) 
    html_thread=Thread(name='HTML',target=html_main)

    main_thread.start();
    html_thread.start();

    main_thread.join();
    html_thread.join();

else :
    print("PLEASE EDIT THIS FILE AND UPDATE THE LINE channel_name=''; with the channel name to listen to (lowercase)");

    
    
