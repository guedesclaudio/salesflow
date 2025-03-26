import { registerEnumType } from "@nestjs/graphql";

export enum Service {
    STORAGE = 'storage.service',
    CONFIG = 'config.service',
}

export enum Role {
    RESTRICTED = 'restricted'
}

registerEnumType(Role, {
    name: 'Role',
    description: 'The role of the user, which determines permissions',
});