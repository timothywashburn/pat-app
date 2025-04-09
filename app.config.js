export default ({ config }) => ({
    ...config,
    name: getAppName(),
    ios: {
        ...config.ios,
        bundleIdentifier: getIdentifier(),
    },
    android: {
        ...config.android,
        package: getIdentifier(),
    },
});

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

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
