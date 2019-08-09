const saveSpatialBoundsRoute = {
  path: '/api/spatial/save',
  method: 'GET',
  middleware: 'auth',
  handler(request, h) {
    // FIXME: persist geometries to firebase or mongodb associated with username
    return {
      works: true
    }
  }
}

module.exports = [saveSpatialBoundsRoute]
