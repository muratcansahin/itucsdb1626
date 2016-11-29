import foodle
import psycopg2
from psycopg2.extras import DictCursor

from flask import Blueprint, render_template, current_app, request, redirect, make_response

place_instances_controller = Blueprint('place_instances_controller',__name__)

@place_instances_controller.route('/', methods=['GET'])
def index():

    acceptType = request.headers.get('accept')
    limit = request.args.get('limit') or 20
    offset = request.args.get('offset') or 0
    name = request.args.get('name')

    if acceptType == 'application/json':
        with psycopg2.connect(foodle.app.config['dsn']) as conn:
            with conn.cursor(cursor_factory=DictCursor) as curs:
                if name is not None:
                    curs.execute(
                    """
                    SELECT *
                    FROM places p
                    WHERE p.name ILIKE %s
                    LIMIT %s
                    OFFSET %s
                    """,
                    ['%' + name + '%', limit, offset])
                else:
                    curs.execute(
                    """
                    SELECT *
                    FROM places p
                    LIMIT %s
                    OFFSET %s
                    """,
                    [limit, offset])

                places = curs.fetchall()

                return jsonify(places)
    else:
        with psycopg2.connect(foodle.app.config['dsn']) as conn:
            with conn.cursor(cursor_factory = DictCursor) as curs:
                curs.execute(
                """
                SELECT *
                FROM place_instances
                LIMIT %s
                OFFSET %s
                """,
                [limit, offset])

                place_instances = curs.fetchall()

                curs.execute(
                """
                SELECT count(id)
                FROM place_instances
                """
                )
                count = curs.fetchone()[0]

                return render_template('place_instances/index.html', place_instances=place_instances, count=count)

@place_instances_controller.route('/<int:id>',methods=['GET'])
def show(id):
    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory = DictCursor) as curs:
            curs.execute(
            """
            SELECT *
            FROM place_instances
            WHERE id = %s
            """,
            [id]
            )

            place_instance = curs.fetchone()

            if place_instance is not None:
                return render_template('place_instances/show.html', place_instance=place_instance)
            else:
                return "Place Instance not found.",404


@place_instances_controller.route('/', methods=['POST'])
def create():
    name = request.json['name']
    capacity = request.json['capacity']
    user_id = int(request.json['user_id'])
    place_id = int(request.json['place_id'])
    city_id = int(request.json['city_id'])
    address = request.json['address']

    if not isinstance(name, str) or not isinstance(capacity, str) or not isinstance(user_id, int) or not isinstance(place_id, int) or not isinstance(city_id, int) or not isinstance(address, str):
        return "Request body is unprocessable.", 422

    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory=DictCursor) as curs:
            curs.execute(
            """
            INSERT INTO place_instances
            (name, user_id, place_id, capacity, city_id, address)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            [name, user_id, place_id, capacity, city_id, address]
            )
            place_instance = curs.fetchone()

            resp = make_response()
            resp.headers['location'] = '/place_instances/' + str(place_instance['id'])
            return resp, 201

@place_instances_controller.route('/new', methods=['GET'])
def new():
    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory=DictCursor) as curs:
            curs.execute(
            """
            SELECT id, username
            FROM users
            """,
            )
            users = curs.fetchall()

            curs.execute(
            """
            SELECT id, name
            FROM places
            """,
            )
            places = curs.fetchall()

            curs.execute(
            """
            SELECT id, name
            FROM cities
            """,
            )
            cities = curs.fetchall()

            return render_template('/place_instances/new.html',users=users, cities=cities, places=places)


@place_instances_controller.route('/<int:id>', methods=['PUT', 'PATCH'])
def update(id):

    name = request.json['name']
    capacity = request.json['capacity']
    address = request.json['adrress']

    if request.json.get('id') is not None or not isinstance(name, str) or not isinstance(capacity, str) or not isinstance(address, str):
        return "Request body is unprocessable.", 422

    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory=DictCursor) as curs:
            curs.execute(
            """
            UPDATE place_instances
            SET name = %s,
                capacity = %s,
                address = %s
            WHERE id = %s
            """,
            [name, capacity, address, id]
            )

            if curs.rowcount is not 0:
                resp = make_response()
                resp.headers['location'] = '/place_instances/' + str(id)
                return resp, 200
            else:
                return "Place Instance not found.", 404

@place_instances_controller.route('/<int:id>/edit', methods=['GET'])
def edit(id):
    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory=DictCursor) as curs:
            curs.execute(
            """
            SELECT *
            FROM place_instances
            WHERE id = %s
            """, [id]
            )
            place_instance = curs.fetchone()

            if place_instance is not None:
                return render_template ('/place_instances/edit.html', place_instance = place_instance)
            else:
                return "Entity not found.", 404

@place_instances_controller.route('/<int:id>', methods=['DELETE'])
def delete(id):
    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory=DictCursor) as curs:
            curs.execute(
            """
            DELETE FROM place_instances
            WHERE id = %s
            """, [id]
            )

            if curs.rowcount is not 0:
                return "", 204
            else:
                return "Place instance not found.", 404
