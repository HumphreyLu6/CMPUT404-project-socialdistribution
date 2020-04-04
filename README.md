CMPUT404-project-socialdistribution
===================================

[![Build Status](https://travis-ci.org/404-SpongeBob-SquarePants/CMPUT404-project-socialdistribution.svg?branch=master)](https://travis-ci.org/github/404-SpongeBob-SquarePants/CMPUT404-project-socialdistribution)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

CMPUT404-project-socialdistribution

See project.org (plain-text/org-mode) for a description of the project.

Make a distributed social network!

Getting Started
===============

The following instructions will get you a copy of this project and you can run the project on your local machine.

### Prerequisites

You need to install the following software:

* Node - v12.16.1

* npm - 6.13.4

* Python - 3.6.8

### Clone

* Clone this repo to your local machine using `git clone https://github.com/404-SpongeBob-SquarePants/CMPUT404-project-socialdistribution.git`

### Structure
    .
    ├── comment                 # Backend app
    ├── friend                  # Backend app  
    ├── mysite                  # Backend app 
    ├── node                    # Backend app 
    ├── post                    # Backend app
    ├── public                  # Frontend resource
    ├── src                     # Frontend source code
    ├── user                    # Backend app
    ├── manage.py               # Backend Django entry
    ├── package.json            # Node package
    ├── Procfile                # Heroku config
    ├── requirements.txt        # Python Package
    ├── runtime.txt             # Python version
    ├── LICENSE                 
    └── README.md               

### Setup

> Install the package for frontend 

```shell
$ npm install 
```
> Install the package for backend 

```shell
$ pip install -r requirements.txt
$ python manage.py migrate
```

### Run

> Run frontend 

```shell
$ npm start
```
> Run backend 

```shell
$ python manage.py runserver
```

### Running the tests
```
$ npm test
$ python manage.py test
```

Documentation
=============

* Backend APIs: the documentation of our backend APIs are located at the [Wiki page](https://github.com/404-SpongeBob-SquarePants/CMPUT404-project-socialdistribution/wiki)

Contributors / Licensing
========================

Generally everything is LICENSE'D under the Apache 2 license by Abram Hindle.

All text is licensed under the CC-BY-SA 4.0 http://creativecommons.org/licenses/by-sa/4.0/deed.en_US

Contributors:

* Devin Dai

* Isaac Zhang

* Qiaoyan Zhang

* Yuan Wang

* Zhonghao Lu

Acknowledgments
===============