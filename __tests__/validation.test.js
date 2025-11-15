import { validate, clientSchema, projectSchema } from '../validation/schemas';

describe('Validation Schemas', () => {
  describe('clientSchema', () => {
    it('valide un client correct', () => {
      const validClient = {
        name: 'Jean Dupont',
        phone: '0612345678',
        email: 'jean@example.com',
        address: '123 Rue de la Paix',
        postalCode: '75001',
        city: 'Paris',
      };

      const result = validate(clientSchema, validClient);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validClient);
    });

    it('rejette un client avec nom trop court', () => {
      const invalidClient = {
        name: 'J',
        address: '123 Rue de la Paix',
      };

      const result = validate(clientSchema, invalidClient);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('name');
    });

    it('rejette un email invalide', () => {
      const invalidClient = {
        name: 'Jean Dupont',
        email: 'email-invalide',
        address: '123 Rue de la Paix',
      };

      const result = validate(clientSchema, invalidClient);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('email');
    });
  });

  describe('projectSchema', () => {
    it('valide un projet correct', () => {
      const validProject = {
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Rénovation cuisine',
        address: '456 Avenue Test',
        status: 'active',
      };

      const result = validate(projectSchema, validProject);
      expect(result.success).toBe(true);
    });

    it('rejette un projet sans client_id', () => {
      const invalidProject = {
        name: 'Rénovation cuisine',
      };

      const result = validate(projectSchema, invalidProject);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('client_id');
    });

    it('rejette un statut invalide', () => {
      const invalidProject = {
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Rénovation cuisine',
        status: 'statut-invalide',
      };

      const result = validate(projectSchema, invalidProject);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('status');
    });
  });
});

