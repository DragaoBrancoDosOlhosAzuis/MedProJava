-- Corrigir estrutura da tabela medicos para usar Endereço embedded
ALTER TABLE medicos 
DROP COLUMN logradouro,
DROP COLUMN bairro, 
DROP COLUMN cep,
DROP COLUMN complemento,
DROP COLUMN numero,
DROP COLUMN uf,
DROP COLUMN cidade;

-- Adicionar colunas do Endereço como embeddable
ALTER TABLE medicos 
ADD COLUMN logradouro VARCHAR(100),
ADD COLUMN bairro VARCHAR(100),
ADD COLUMN cep VARCHAR(9),
ADD COLUMN complemento VARCHAR(100),
ADD COLUMN numero VARCHAR(20),
ADD COLUMN uf CHAR(2),
ADD COLUMN cidade VARCHAR(100);