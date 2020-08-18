const saveSpatialBoundsRoute = {
  path: '/api/spatial/save',
  method: 'GET',
  handler(request, h) {
    // FIXME: persist geometries to firebase or mongodb associated with username
    return {
      works: true,
    }
  },
}

module.exports = [saveSpatialBoundsRoute]
