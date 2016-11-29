#!/usr/bin/env python3
import foodle
from flask import Blueprint, render_template, current_app, request
import psycopg2
from psycopg2.extras import RealDictCursor, DictCursor

feed_controller = Blueprint('feed_controller', __name__)

@feed_controller.route('/<int:id>/feed/', methods=['GET'])
def index(id):
    limit = request.args.get('limit') or 20
    offset = request.args.get('offset') or 0

    with psycopg2.connect(foodle.app.config['dsn']) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as curs:
            curs.execute(
            """
            SELECT url
            FROM user_images
            WHERE user_id = %s
            """,
            [id])

            image_url = curs.fetchone()['url']

            curs.execute(
            """
            SELECT f.*, pl.user_id IS NOT NULL is_liked
            FROM feed f
            LEFT OUTER JOIN post_likes pl ON f.post_id = pl.post_id
            WHERE pl.user_id = %s OR pl.user_id IS NULL
            LIMIT %s
            OFFSET %s
            """,
            [id, limit, offset])

            feeds = curs.fetchall()

            print(feeds)

            for each_feed in feeds:
                curs.execute(
                """
                SELECT link
                FROM post_images
                WHERE post_id = %s
                LIMIT 5
                """,
                [each_feed['post_id']])

                each_feed['post_images'] = curs.fetchall()

            return render_template('/users/feed/index.html', feeds=feeds, image_url=image_url, user_id=id)
