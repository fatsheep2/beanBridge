import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/tests/**/*.test.ts'],
        coverage: {
            reporter: ['text', 'html'],
            exclude: ['src/tests/manual-test.ts']
        },
        mockReset: true
    }
}); 