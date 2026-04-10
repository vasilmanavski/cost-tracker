-- V2: Demo seed data for development
-- Spans March and April 2026 to populate dashboard with realistic data

INSERT INTO expense (merchant, description, amount, currency, category, expense_date, source_type, needs_review, notes) VALUES
-- April 2026 (current month)
('Starbucks',           'Morning latte and pastry',         8.75,   'USD', 'coffee',          '2026-04-01', 'MANUAL', false, null),
('Uber',                'Ride to downtown office',          14.50,  'USD', 'transport',        '2026-04-02', 'MANUAL', false, null),
('Netflix',             'Monthly subscription',             15.99,  'USD', 'subscriptions',    '2026-04-03', 'MANUAL', false, null),
('Safeway',             'Weekly groceries',                 82.34,  'USD', 'groceries',        '2026-04-04', 'MANUAL', false, null),
('Chipotle',            'Lunch with coworkers',             13.25,  'USD', 'restaurants',      '2026-04-04', 'MANUAL', false, null),
('CVS Pharmacy',        'Cold medicine and vitamins',       24.99,  'USD', 'health',           '2026-04-05', 'MANUAL', false, null),
('Spotify',             'Premium subscription',             10.99,  'USD', 'subscriptions',    '2026-04-05', 'MANUAL', false, null),
('Shell Gas Station',   'Gas fill-up',                      52.80,  'USD', 'transport',        '2026-04-06', 'MANUAL', false, null),
('Amazon',              'USB-C cable and phone case',       29.98,  'USD', 'shopping',         '2026-04-07', 'MANUAL', false, null),
('Blue Bottle Coffee',  'Iced pour-over',                   6.50,   'USD', 'coffee',           '2026-04-07', 'MANUAL', false, null),
('AMC Theatres',        'Movie tickets x2',                 28.00,  'USD', 'entertainment',    '2026-04-08', 'MANUAL', false, null),
('PG&E',                'Electric bill',                    87.43,  'USD', 'bills',            '2026-04-08', 'MANUAL', false, null),

-- March 2026 (previous month)
('Trader Joes',         'Weekly groceries',                 64.21,  'USD', 'groceries',        '2026-03-02', 'MANUAL', false, null),
('Lyft',                'Airport ride',                     38.50,  'USD', 'transport',        '2026-03-03', 'MANUAL', false, null),
('United Airlines',     'Flight to Seattle',                189.00, 'USD', 'travel',           '2026-03-05', 'MANUAL', false, 'Work conference'),
('Marriott',            'Hotel 2 nights',                   312.00, 'USD', 'travel',           '2026-03-06', 'MANUAL', false, 'Seattle conference hotel'),
('Peets Coffee',        'Coffee and muffin',                9.25,   'USD', 'coffee',           '2026-03-10', 'MANUAL', false, null),
('Target',              'Household supplies',               45.67,  'USD', 'shopping',         '2026-03-12', 'MANUAL', false, null),
('Comcast',             'Internet bill',                    65.00,  'USD', 'bills',            '2026-03-15', 'MANUAL', false, null),
('Whole Foods',         'Groceries and wine',               93.42,  'USD', 'groceries',        '2026-03-18', 'MANUAL', false, null),
('Sushi Ran',           'Dinner date',                      78.50,  'USD', 'restaurants',      '2026-03-20', 'MANUAL', false, null),
('Planet Fitness',      'Monthly gym membership',           22.99,  'USD', 'health',           '2026-03-22', 'MANUAL', false, null),
('HBO Max',             'Monthly subscription',             15.99,  'USD', 'subscriptions',    '2026-03-25', 'MANUAL', false, null),
('Safeway',             'Quick grocery run',                31.55,  'USD', 'groceries',        '2026-03-28', 'MANUAL', false, null);
