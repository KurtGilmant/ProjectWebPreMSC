-- Job categories
CREATE TABLE Job_Category (
    job_category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- Skills
CREATE TABLE Skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- Companies
CREATE TABLE Company (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    website VARCHAR(200),
    location VARCHAR(200),
    description TEXT
);

-- Offers
CREATE TABLE Offer (
    offer_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    company_id INT NOT NULL,
    location VARCHAR(50) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    salary INT,
    category_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    rythm VARCHAR(50),
    remote VARCHAR(50),
    language VARCHAR(30),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES Company(company_id),
    FOREIGN KEY (category_id) REFERENCES Job_Category(job_category_id)
);

-- Users
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) DEFAULT 'candidate',
    resume TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Applications
CREATE TABLE Application (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    user_id INT NOT NULL,
    applicant_name VARCHAR(255),
    applicant_email VARCHAR(255),
    resume TEXT,
    message TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'not reviewed',

    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- User skills (many-to-many)
CREATE TABLE User_Skills (
    user_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
);

-- Offer sought skills (many-to-many)
CREATE TABLE Sought_Skills (
    sought_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    skill_id INT NOT NULL,
    
    FOREIGN KEY (offer_id) REFERENCES Offer(offer_id),
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
);


-- Insertion des catégories de métiers
INSERT INTO Job_Category (name) VALUES
('Developpement Web'),
('Data Science'),
('Cybersecurite');

-- Insertion des compétences
INSERT INTO Skills (name) VALUES
('JavaScript'),
('Python'),
('SQL'),
('Docker');

-- Insertion des entreprises
INSERT INTO Company (name, website, location, description) VALUES
('OpenAI', 'https://openai.com', 'San Francisco', 'Entreprise de recherche en intelligence artificielle.'),
('Epitech', 'https://epitech.eu', 'Paris', 'Ecole d’informatique innovante.');

-- Insertion des offres
INSERT INTO Offer (
    title, description, company_id, location, contract_type, salary,
    category_id, rythm, remote, language
) VALUES
('Developpeur Fullstack', 'Travaillez sur des projets innovants en IA.', 1, 'Paris', 'CDI', 55000, 1, 'Temps plein', 'Hybride', 'Français'),
('Data Scientist Junior', 'Analyse de donnees massives pour projets IA.', 2, 'Lyon', 'CDD', 42000, 2, 'Temps plein', 'Oui', 'Anglais');

-- Insertion des compétences recherchées pour les offres
INSERT INTO Sought_Skills (offer_id, skill_id) VALUES
(1, 1), -- JavaScript pour l'offre 1
(1, 3), -- SQL pour l'offre 1
(2, 2), -- Python pour l'offre 2
(2, 4); -- Docker pour l'offre 2

-- Insertion des utilisateurs
INSERT INTO User (email, password, full_name, resume) VALUES
('alexis.baron@epitech.eu', 'biboop', 'Baron Alexis', 'Ceci est mon CV incroyable !'),
('marie.dubois@example.com', 'securepass', 'Marie Dubois', 'Passionnee par la data science.');

-- Insertion des candidatures
INSERT INTO Application (offer_id, user_id, applicant_name, applicant_email, resume, message) VALUES
(1, 1, 'Baron Alexis', 'alexis.baron@epitech.eu', 'Ceci est mon CV incroyable !', 'Motive et passionne par le developpement.'),
(2, 2, 'Marie Dubois', 'marie.dubois@example.com', 'Passionnee par la data science.', 'Je souhaite contribuer à vos projets IA.');

-- Insertion des compétences utilisateurs
INSERT INTO User_Skills (user_id, skill_id) VALUES
(1, 1), -- Alexis : JavaScript
(1, 3), -- Alexis : SQL
(2, 2), -- Marie : Python
(2, 4); -- Marie : Docker
