# KickChat-Chataigne-Module
A simple module to use Kick Chat with the Chataigne Software

link :  <a href="http://benjamin.kuperberg.fr/chataigne/en" target="_blank">Chataigne Software </a> By Benjamin Kuperberg

# Pre requisites 
  - python 3
  - pip
  - gecko driver (firefox has to be installed on the system)
  
 # How to use
   - extract the zip in the folder where Chataigne community modules are located on your system
   - download the gecko driver from https://github.com/mozilla/geckodriver/releases and put the binary file in the kick module folder
   - edit, with a text editor, **kickChat.py** and complete at the beginning of the file:  **channel_name=''** with the channel you want to scrape (lowercase)
   - run a terminal, and being in the kick module directory,type **pip install -r requirements.txt**
   - then type **python kickChat.py**
   - check if the **|| MAIN ||  Getting data from https://kick.com/api/v2/channels/...** lines are present, that indicates the script is actually scraping data on Kick urls
   - load the kick chat module into Chataigne
   - check the base address of the module is **http://localhost:8000/**
   - fill the **channel name** parameter of the module with the kick channel name (lowercase)
   - wait few seconds and check if the **channel id** field has been automatically filled
   - enjoy and thank you for giving a feedback

# Notes
**Important note :** For the moment this module is for listening only; you wont be able to send any chat command.

As said above, we need to have some webscraping task running.
There is a kickChat.py python script that, using selenium and gecko webdriver, will gather data on both urls.

It will then provides the 2 json objects on :
  -  http://localhost:8000/{anything}                    for stream info
  -  http://localhost:8000/{anything with '/messages'} for stream chat 

Doing so, the chataigne module keeps being designed as a http module doing GET request to catch the data.

This post on reddit (https://www.reddit.com/r/KickStreaming/comments/11u9xpk/kick_api/) ), indicates there is a v1 "API" that we may use to control more stuff.
See the ziggy.json file for details.

# Change records
### V0.1  (30082023 )  Initial version. 
  - Lot of stuff to do/clean


