CREATE DATABASE listanozze;

CREATE TABLE category (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    sequence integer NOT NULL
);

CREATE TABLE store (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    info varchar(500) NOT NULL,
    email varchar(100),
    sequence integer NOT NULL
);

CREATE TABLE payment_type (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    info varchar(500) NOT NULL,
    sequence integer NOT NULL
);

CREATE TABLE person (
    id serial PRIMARY KEY,
    email varchar(100) NULL,
    password varchar(100) NULL
);

CREATE TABLE item (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    info varchar(500),
    photo_url varchar(200),
    price numeric(10, 2),
    is_partial_payment_allowed boolean NOT NULL DEFAULT false,
    store_id integer NOT NULL,
    sequence integer NOT NULL,
    FOREIGN KEY (store_id) REFERENCES store (id)
);

CREATE TABLE item_category (
    item_id integer NOT NULL,
    category_id integer NOT NULL,
    PRIMARY KEY (item_id, category_id),
    FOREIGN KEY (item_id) REFERENCES item (id),
    FOREIGN KEY (category_id) REFERENCES category (id)
);

CREATE TABLE item_available_payment_type (
    item_id integer NOT NULL,
    payment_type_id integer NOT NULL,
    PRIMARY KEY (item_id, payment_type_id),
    FOREIGN KEY (item_id) REFERENCES item (id),
    FOREIGN KEY (payment_type_id) REFERENCES payment_type (id)
);

CREATE TABLE payment (
    id serial PRIMARY KEY,
    signature varchar(500) NOT NULL,
    message varchar(1000) NOT NULL,
    creation_date timestamp NOT NULL DEFAULT now(),
    total_amount numeric(10, 2) NOT NULL,
    payment_type_id integer NOT NULL,
    confirmation_date timestamp,
    FOREIGN KEY (payment_type_id) REFERENCES payment_type (id)
);

CREATE TABLE purchase (
    item_id integer NOT NULL,
    payment_id integer NULL,
    person_id integer NOT NULL,
    amount numeric(10, 2) NOT NULL,
    PRIMARY KEY (item_id, person_id),
    FOREIGN KEY (item_id) REFERENCES item (id),
    FOREIGN KEY (payment_id) REFERENCES payment (id),
    FOREIGN KEY (person_id) REFERENCES person (id)
);

CREATE VIEW v_item_category AS
SELECT
	item_id,
	array_agg(
		json_build_object(
			'id', category.id,
			'name', category.name,
			'sequence', category.sequence
		)
		ORDER BY category.sequence asc
	) as categories
FROM
	item_category
	JOIN category ON (item_category.category_id = category.id)
GROUP BY
	item_id
;

CREATE VIEW v_item_available_payment_type AS
SELECT
	item_id,
	array_agg(
		json_build_object(
            'id', payment_type.id,
            'name', payment_type.name,
            'info', payment_type.info,
            'sequence', payment_type.sequence
		)
		ORDER BY payment_type.sequence asc
	) as payment_types
FROM
	item_available_payment_type
	JOIN payment_type ON (item_available_payment_type.payment_type_id = payment_type.id)
GROUP BY
	item_id
;

CREATE VIEW v_purchase AS
SELECT
	item_id,
	sum(amount) as amount
FROM
	purchase
WHERE
    payment_id IS NOT NULL
GROUP BY
	item_id
;

CREATE VIEW v_item AS
SELECT
	item.id,
	item.name,
	item.info,
	item.photo_url,
	item.price,
	item.is_partial_payment_allowed,
    item.sequence,
	store.name as store_name,
	store.info as store_info,
    store.email as store_email,
	v_item_category.categories,
	v_item_available_payment_type.payment_types,
	coalesce(v_purchase.amount, 0) as amount
FROM
	item
	JOIN v_item_category ON (item.id = v_item_category.item_id)
	JOIN v_item_available_payment_type ON (item.id = v_item_available_payment_type.item_id)
	JOIN store ON (item.store_id = store.id)
	LEFT JOIN v_purchase ON (item.id = v_purchase.item_id)
ORDER BY
	item.sequence
;