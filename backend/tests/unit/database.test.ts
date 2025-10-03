/// <reference types="jest" />

import sequelize from '../../src/config/database';
import { describe, it, expect, afterAll } from '@jest/globals';

describe('Database connection', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should connect successfully', async () => {
        await expect(sequelize.authenticate()).resolves.not.toThrow();
    });
});