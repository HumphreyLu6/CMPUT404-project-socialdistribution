# SpongeBook

[![Build Status](https://travis-ci.com/HumphreyLu6/SpongeBook.svg?branch=master)](https://travis-ci.org/github/404-SpongeBob-SquarePants/CMPUT404-project-socialdistribution)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Record beautiful life, share with the ones you love.

# Getting Started

The following instructions will get you a copy of this project and you can run the project on your local machine.

### Prerequisites

You need to install the following software:

- Node - v12.16.1

- npm - 6.13.4

- Python - 3.6.8

### Clone

- Clone this repo to your local machine using `git clone https://github.com/HumphreyLu6/SpongeBook.git`

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

> Install the package for backend (virtual environment recommened)

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

### Run tests

```
$ npm test
$ python manage.py test
```

# Documentation

- Backend APIs: please reference our documentation [Wiki page](https://github.com/HumphreyLu6/SpongeBook/wiki)

# Contributors / Licensing

Generally everything is LICENSE'D under the Apache 2 license by Zhonghao Lu.

All text is licensed under the CC-BY-SA 4.0 http://creativecommons.org/licenses/by-sa/4.0/deed.en_US

Contributors:

- Devin Dai

- Isaac Zhang

- Qiaoyan Zhang

- Yuan Wang

- Zhonghao Lu

# [Acknowledgments](https://github.com/HumphreyLu6/SpongeBook/wiki/Acknowledgments)

# Demo Video

- [YouTube](https://www.youtube.com/watch?v=jtxW7VnxjQ8)
- [bilibili](https://www.bilibili.com/video/BV1BK411L7a9)
- [Download](https://github.com/HumphreyLu6/SpongeBook/wiki/SpongeBookDemo.mp4)
