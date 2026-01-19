<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260114145854 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

   public function up(Schema $schema): void
{
    // 1. On ajoute la colonne en autorisant le NULL au début
    $this->addSql('ALTER TABLE booking ADD status VARCHAR(20) DEFAULT NULL');

    // 2. On remplit toutes les anciennes lignes avec la valeur 'pending'
    $this->addSql("UPDATE booking SET status = 'pending'");

    // 3. On remet la contrainte NOT NULL maintenant que c'est rempli
    $this->addSql('ALTER TABLE booking ALTER COLUMN status SET NOT NULL');
}

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE booking DROP status');
    }
}
