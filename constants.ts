
import { Preset } from './types';

export const MODEL_CONFIG = {
    name: 'granite-8b-code-instruct',
    maxInputTokens: 65101,
    averageCharsPerToken: 4,
} as const;

export const MAX_OUTPUT_CHARACTERS = MODEL_CONFIG.maxInputTokens * MODEL_CONFIG.averageCharsPerToken;

export const DEFAULT_EXCLUDES: string[] = [
    "**/.git/**", "**/.github/**", "**/.gitlab/**",
    "**/.idea/**", "**/.vscode/**",
    "**/__pycache__/**", "**/.mypy_cache/**", "**/.pytest_cache/**", "**/.ruff_cache/**",
    "**/.cache/**", "**/node_modules/**", "**/dist/**", "**/build/**", "**/.parcel-cache/**",
    "**/.next/**", "**/.nuxt/**", "**/coverage/**", "**/site/**",
    "**/target/**", "**/bin/**", "**/obj/**",
    "**/.venv/**", "**/venv/**", "**/env/**",
];

export const PRESETS: Preset[] = [
    {
        name: "full-stack",
        options: {
            include: ["**/*"],
            exclude: [
                ...DEFAULT_EXCLUDES,
                "**/*.lock", "**/package-lock.json", "**/yarn.lock", "**/pnpm-lock.yaml",
            ],
            maxSize: 2000000,
            binaryMode: "skip",
            showMetadata: true,
            sort: "path",
        },
    },
    {
        name: "python-web",
        options: {
            include: ["**/*.py", "**/*.toml", "**/*.ini", "**/*.cfg", "**/*.conf", "**/*.md", "**/*.txt", "**/*.json", "**/*.yaml", "**/*.yml", "**/templates/**/*.html", "**/static/**/*"],
            exclude: ["**/.venv/**", "**/venv/**", "**/env/**", "**/__pycache__/**", "**/.mypy_cache/**", "**/.pytest_cache/**", "**/dist/**", "**/build/**", "**/.cache/**"],
            maxSize: 1000000,
            binaryMode: "skip",
        },
    },
    {
        name: "react",
        options: {
            include: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js", "**/*.css", "**/*.scss", "**/*.html", "**/*.json", "**/*.md", "**/*.yaml", "**/*.yml", "public/**/*"],
            exclude: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.parcel-cache/**", "**/.next/**", "**/.nuxt/**", "**/coverage/**"],
            maxSize: 800000,
            binaryMode: "skip",
        },
    },
    {
        name: "node-app",
        options: {
            include: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.ts", "**/*.json", "**/*.md", "**/*.yaml", "**/*.yml", "**/*.env*", "**/.env*"],
            exclude: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.parcel-cache/**", "**/.next/**", "**/.nuxt/**", "**/coverage/**", "**/*.lock", "**/package-lock.json", "**/yarn.lock", "**/pnpm-lock.yaml"],
            maxSize: 1000000,
            binaryMode: "skip",
        },
    },
    {
        name: "data-science",
        options: {
            include: ["**/*.py", "**/*.ipynb", "**/*.md", "**/*.txt", "**/*.csv", "**/*.json", "**/*.yaml", "**/*.yml", "**/*.toml"],
            exclude: ["**/.venv/**", "**/__pycache__/**", "**/.ipynb_checkpoints/**", "**/wandb/**", "**/mlruns/**", "**/data/**", "**/datasets/**", "**/dist/**", "**/build/**"],
            maxSize: 1500000,
            binaryMode: "skip",
        },
    },
    {
        name: "rust-crate",
        options: {
            include: ["**/*.rs", "Cargo.toml", "Cargo.lock", "**/*.md", "**/*.yaml", "**/*.yml"],
            exclude: ["**/target/**", "**/dist/**"],
            maxSize: 800000,
        },
    },
    {
        name: "java-maven",
        options: {
            include: ["**/*.java", "pom.xml", "**/*.md", "**/*.yaml", "**/*.yml", "**/*.xml", "**/*.properties"],
            exclude: ["**/target/**", "**/out/**", "**/.idea/**"],
            maxSize: 1000000,
        },
    },
    {
        name: "dotnet",
        options: {
            include: ["**/*.cs", "**/*.csproj", "**/*.sln", "**/*.json", "**/*.md", "**/*.yaml", "**/*.yml"],
            exclude: ["**/bin/**", "**/obj/**"],
            maxSize: 1000000,
        },
    }
];
