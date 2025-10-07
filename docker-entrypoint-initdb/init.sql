-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/ITl0hT
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE `Offer` (
    `offer_id` int  NOT NULL AUTO_INCREMENT,
    `title` varchar(50)  NOT NULL ,
    `description` text  NOT NULL ,
    `company_id` int  NOT NULL ,
    `location` varchar(50)  NOT NULL ,
    `contract_type` varchar(50)  NOT NULL ,
    `salary` int  NOT NULL ,
    `category_id` int  NOT NULL ,
    `status` varchar(50)  NOT NULL DEFAULT 'open',
    `skill_sought_id` int  NOT NULL ,
    `rythm` varchar(50)  NOT NULL ,
    `remote` varchar(50)  NOT NULL ,
    `language` varchar(30)  NOT NULL ,
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    PRIMARY KEY (
        `offer_id`
    )
);

CREATE TABLE `Company` (
    `company_id` int  NOT NULL AUTO_INCREMENT,
    `name` varchar(200)  NOT NULL ,
    `website` varchar(200)  NOT NULL ,
    `location` varchar(200)  NOT NULL ,
    `description` text  NOT NULL ,
    `offer_id` int  NOT NULL ,
    PRIMARY KEY (
        `company_id`
    )
);

CREATE TABLE `User` (
    `user_id` int  NOT NULL AUTO_INCREMENT,
    `email` varchar(200)  NOT NULL ,
    `password` varchar(200)  NOT NULL ,
    `full_name` varchar(200)  NOT NULL ,
    `role` varchar(200)  NOT NULL DEFAULT 'candidate',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `resume` text  NOT NULL ,
    `application_id` int  NOT NULL ,
    `skill_user_id` int  NOT NULL ,
    PRIMARY KEY (
        `user_id`
    )
);

CREATE TABLE `Application` (
    `application_id` int  NOT NULL AUTO_INCREMENT,
    `offer_id` int  NOT NULL ,
    `user_id` int  NOT NULL ,
    `applicant_name` varchar(255)  NOT NULL ,
    `applicant_email` varchar(255)  NOT NULL ,
    `resume` text  NOT NULL ,
    `applied_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` varchar(50)  NOT NULL DEFAULT 'not review',
    `message` text  NOT NULL ,
    PRIMARY KEY (
        `application_id`
    )
);

CREATE TABLE `Job_Category` (
    `job_category_id` int  NOT NULL ,
    `name` varchar(50)  NOT NULL ,
    PRIMARY KEY (
        `job_category_id`
    )
);

CREATE TABLE `Skills` (
    `skill_id` int  NOT NULL ,
    `name` varchar(50)  NOT NULL ,
    PRIMARY KEY (
        `skill_id`
    )
);

CREATE TABLE `User_skills` (
    `user_skill_id` int  NOT NULL AUTO_INCREMENT,
    `user_id` int  NOT NULL ,
    `skill_id` int  NOT NULL ,
    PRIMARY KEY (
        `user_skill_id`
    )
);

CREATE TABLE `Sought_skills` (
    `sought_skill_id` int  NOT NULL AUTO_INCREMENT,
    `offer_id` int  NOT NULL ,
    `skill_id` int  NOT NULL ,
    PRIMARY KEY (
        `sought_skill_id`
    )
);

ALTER TABLE `Offer` ADD CONSTRAINT `fk_Offer_company_id` FOREIGN KEY(`company_id`)
REFERENCES `Company` (`company_id`);

ALTER TABLE `Offer` ADD CONSTRAINT `fk_Offer_category_id` FOREIGN KEY(`category_id`)
REFERENCES `Job_Category` (`job_category_id`);

ALTER TABLE `Offer` ADD CONSTRAINT `fk_Offer_skill_sought_id` FOREIGN KEY(`skill_sought_id`)
REFERENCES `Sought_skills` (`sought_skill_id`);

ALTER TABLE `Company` ADD CONSTRAINT `fk_Company_offer_id` FOREIGN KEY(`offer_id`)
REFERENCES `Offer` (`offer_id`);

ALTER TABLE `User` ADD CONSTRAINT `fk_User_application_id` FOREIGN KEY(`application_id`)
REFERENCES `Application` (`application_id`);

ALTER TABLE `User` ADD CONSTRAINT `fk_User_skill_user_id` FOREIGN KEY(`skill_user_id`)
REFERENCES `User_skills` (`user_skill_id`);

ALTER TABLE `Application` ADD CONSTRAINT `fk_Application_offer_id` FOREIGN KEY(`offer_id`)
REFERENCES `Offer` (`offer_id`);

ALTER TABLE `Application` ADD CONSTRAINT `fk_Application_user_id` FOREIGN KEY(`user_id`)
REFERENCES `User` (`user_id`);

ALTER TABLE `User_skills` ADD CONSTRAINT `fk_User_skills_user_id` FOREIGN KEY(`user_id`)
REFERENCES `User` (`user_id`);

ALTER TABLE `User_skills` ADD CONSTRAINT `fk_User_skills_skill_id` FOREIGN KEY(`skill_id`)
REFERENCES `Skills` (`skill_id`);

ALTER TABLE `Sought_skills` ADD CONSTRAINT `fk_Sought_skills_offer_id` FOREIGN KEY(`offer_id`)
REFERENCES `Offer` (`offer_id`);

ALTER TABLE `Sought_skills` ADD CONSTRAINT `fk_Sought_skills_skill_id` FOREIGN KEY(`skill_id`)
REFERENCES `Skills` (`skill_id`);

INSERT INTO user (email,password,full_name,resume,application_id,skill_user_id) VALUES(
     ,
     alexis.baron@epitech.eu
     biboop
     Baron Alexis
     "Ceci est mon CV incroyable !"
     10
     9
);