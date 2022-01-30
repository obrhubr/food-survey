/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    /*
    CREATE TABLE menus (
        id SERIAL PRIMARY KEY,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        vegetarian BOOLEAN NOT NULL,
        open BOOLEAN NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT current_timestamp
    );
    */
    pgm.createTable('menus', {
        id: 'id',
        day: { type: 'text', notNull: true},
        name: { type: 'text', notNull: true },
        vegetarian: { type: 'boolean', notNull: true },
        open: { type: 'boolean', notNull: true },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
    /*
    CREATE TABLE votes (
        id SERIAL PRIMARY KEY,
        menuid INT NOT NULL,
        day TEXT NOT NULL,
        vote INT NOT NULL,
        class INT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT current_timestamp,
        CONSTRAINT menuid FOREIGN KEY (id) REFERENCES menus (id)
    );
    */
    pgm.createTable('votes', {
        id: 'id',
        menuid: {
            type: 'integer',
            notNull: true,
            references: '"menus"',
            onDelete: 'cascade',
        },
        day: { type: 'text', notNull: true },
        vote: { type: 'integer', notNull: true },
        class: { type: 'integer', notNull: true },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
    /*
    CREATE TABLE stats (
        id SERIAL PRIMARY KEY,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        jsondata TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT current_timestamp
    );
    */
    pgm.createTable('stats', {
        id: 'id',
        day: { type: 'text', notNull: true },
        name: { type: 'text', notNull: true },
        jsondata: { type: 'text', notNull: true },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
    /*
    CREATE INDEX votes_idx ON votes (menuid);
    */
    pgm.createIndex('votes', 'menuid')
}

exports.down = pgm => {};
