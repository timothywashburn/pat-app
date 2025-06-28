const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

export default ({ config }) => {
    const appName = getAppName();
    const bundleId = getIdentifier();

    const updatedConfig = {
        ...config,
        name: appName,
        extra: {
            ...config.extra,
            APP_VARIANT: process.env.APP_VARIANT,
        },
        ios: {
            ...config.ios,
            bundleIdentifier: bundleId,
        },
        android: {
            ...config.android,
            package: bundleId,
        }
    };

    if (IS_DEV) {
        updatedConfig.ios = {
            ...updatedConfig.ios,
            infoPlist: {
                ...updatedConfig.ios?.infoPlist,
                NSAppTransportSecurity: {
                    NSAllowsArbitraryLoads: true
                }
            }
        };
    }

    return updatedConfig;
};

const getIdentifier = () => {
    if (IS_DEV) return 'dev.timothyw.patapp.dev';
    if (IS_PREVIEW) return 'dev.timothyw.patapp.preview';
    return 'dev.timothyw.patapp';
};

const getAppName = () => {
    if (IS_DEV) return 'Pat (Dev)';
    if (IS_PREVIEW) return 'Pat (Preview)';
    return 'Pat';
};