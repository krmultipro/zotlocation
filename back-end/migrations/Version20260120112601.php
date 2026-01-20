<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260120112601 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER INDEX idx_cb0048d412469de2 RENAME TO idx_listing_category');
        $this->addSql('ALTER INDEX idx_cb0048d4c68be09c RENAME TO idx_listing_localisation');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER INDEX idx_listing_category RENAME TO idx_cb0048d412469de2');
        $this->addSql('ALTER INDEX idx_listing_localisation RENAME TO idx_cb0048d4c68be09c');
    }
}
