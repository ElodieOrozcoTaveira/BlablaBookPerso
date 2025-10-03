/// <reference types="vitest" />

import { describe, it, afterAll, expect } from 'vitest';
import sequelize from '../../src/config/database.js';

// Skip complet si on tourne en mode UNIT_NO_DB
const maybeDescribe = process.env.UNIT_NO_DB === '1' ? describe.skip : describe;

maybeDescribe('Database connection', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should connect successfully', async () => {
        await expect(sequelize.authenticate()).resolves.not.toThrow();
    });
});