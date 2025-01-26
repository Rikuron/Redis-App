// Handles role authorizations

import React from 'react';
import { permissions } from './roles';

const withAuthorization = (WrappedComponent, requiredPermissions) => {
    return (props) => {
        const userRole = props.user.role;
        const userPermissions = permissions[userRole];

        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );
    
        if (!hasPermission) {
            return <div> You do not have permission to view this page! </div>
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuthorization;