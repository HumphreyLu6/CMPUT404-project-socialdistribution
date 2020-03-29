clean:
	rm -rf user/migrations \
    rm -rf friend/migrations \
	rm -rf post/migrations \
	rm -rf comment/migrations \
	rm -rf node/migrations \

migrations:
	sudo activate \
	python manage.py makemigrations user \
	python manage.py makemigrations post \
	python manage.py makemigrations comment \
	python manage.py makemigrations node \
	python manage.py makemigrations friend \
	python manage.py migrate