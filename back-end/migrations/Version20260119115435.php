<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260119115435 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

public function up(Schema $schema): void
{
    // 1. Ajout de la colonne
    $this->addSql('ALTER TABLE listing ADD local_id INT DEFAULT NULL');

    // 2. Remplissage (Ici le nom de la table cible n'importe pas encore)
    $this->addSql('UPDATE listing SET local_id = 1');

    // 3. Passage en NOT NULL
    $this->addSql('ALTER TABLE listing ALTER local_id SET NOT NULL');

    // 4. LA CLÉ ÉTRANGÈRE : C'est ici qu'il faut le nom EXACT de la table
    // Remplacez 'localisation' par le vrai nom si c'est différent
    $this->addSql('ALTER TABLE listing ADD CONSTRAINT FK_CB873C525D5A2101 FOREIGN KEY (local_id) REFERENCES localisation (id)');
}

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE listing DROP local_id');
    }
}
