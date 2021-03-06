[![Build Status](https://travis-ci.org/Iunusov/Vatsim-Flight-Map.svg?branch=master)](https://travis-ci.org/Iunusov/Vatsim-Flight-Map)

# Vatsim Flight Map
[Vatsim](https://wikipedia.org/wiki/VATSIM) aircrafts and ATC on the live map:
https://vatmap.jsound.org/

## Requirements
Webserver with PHP support

## Mapbox API key

Request API key for maps:
https://docs.mapbox.com/help/glossary/access-token/
after that, add your api key to the [prod.js](https://github.com/Iunusov/Vatsim-Flight-Map/blob/master/prod.js) file.

## Build

Install required dependencies:

    $ sudo apt install nodejs npm webpack
    $ sudo apt install memcached php-cli php-xml php-memcache

Build web app:

    $ npm install
    $ webpack

Parser scripts:

    $ cd vatsim_parser
    $ ./parse.php          #you might set up this cron job to run once a minute

## License

MIT License
