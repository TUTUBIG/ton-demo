import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    bail: true,
    maxConcurrency: 1,
    maxWorkers:1,
};

export default config;
