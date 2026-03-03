const IS_DEV = process.env.APP_VARIANT === 'development'

const getUniqueIdentifier = () => {
  console.log('IS_DEV', IS_DEV)
  if (IS_DEV) {
    return 'de.ausminternet.glist.dev'
  }

  return 'de.ausminternet.glist'
}

const getAppName = () => {
  if (IS_DEV) {
    return 'Glist (Dev)'
  }

  return 'Glist'
}

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
})
