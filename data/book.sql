DROP TABLE IF EXISTS booktests;

CREATE TABLE booktests
(
    id SERIAL PRIMARY KEY,
    title varchar(225),
    authors varchar(225),
    description text,
    isbn varchar(225),
    image varchar(225),
    booksehelf varchar(225)
);