define({ "api": [
  {
    "type": "get",
    "url": "/api/status",
    "title": "Get portal status",
    "name": "status",
    "group": "Admin",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Status of portal, versions etc.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"status\": {\n    \"versions\": {\n      \"systemapic_api\": \"1.3.5\",\n      \"postgis\": \"POSTGIS=2.1.7 r13414 GEOS=3.4.2-CAPI-1.8.2 r3921 PROJ=Rel. 4.8.0, 6 March 2012 GDAL=GDAL 1.10.1, released 2013/08/26 LIBXML=2.9.1 LIBJSON=UNKNOWN TOPOLOGY RASTER\",\n      \"postgres\": \"PostgreSQL 9.3.9 on x86_64-unknown-linux-gnu, compiled by gcc (Ubuntu 4.8.2-19ubuntu1) 4.8.2, 64-bit\",\n      \"mongodb\": \"3.2.1\",\n      \"redis\": \"3.0.6\"\n    }\n  }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Admin",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/status"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (403)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/import",
    "title": "Import data",
    "name": "import",
    "group": "Data",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Buffer",
            "optional": false,
            "field": "data",
            "description": "<p>File buffer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Upload Status JSON</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\t\"file_id\":\"file_fxqzngykgzjxtsunulti\",\n\t\"user_id\":\"test-user-uuid\",\n\t\"filename\":\"shapefile.zip\",\n\t\"timestamp\":1453063189097,\n\t\"status\":\"Processing\",\n\t\"size\":109770,\n\t\"upload_success\":true,\n\t\"error_code\":null,\n\t\"error_text\":null\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Data",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/import"
      }
    ],
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (403)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/file/addtoproject",
    "title": "Add file to the project",
    "name": "addToTheProject",
    "group": "File",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "file_id",
            "description": "<p>File id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project_id",
            "description": "<p>Project id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Upload Status JSON</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n _id: '56a76e07b6aa58e535c88d22',\n lastUpdated: '2016-01-26T13:00:55.159Z',\n created: '2016-01-26T13:00:55.018Z',\n createdByUsername: 'relatedProjectCreatedByUsername',\n createdByName: 'relatedProjectCreatedByName',\n createdBy: 'relatedProjectCreatedBy',\n uuid: 'relatedProjectInfo',\n layers: ['56a76e07b6aa58e535c88d23'],\n files: ['56a76e07b6aa58e535c88d21'],\n roles: [],\n access: {\n   options: {\n     isPublic: false,\n     download: false,\n     share: true\n   },\n   edit: [],\n   read: ['test-user-uuid']\n },\n categories: [],\n keywords: [],\n description: 'Description',\n slug: 'projectslug',\n name: 'relatedProjectName'\netc...\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>file_id or project_id does not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>File with specific id not found(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['file_id', 'project_id']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such file\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such project\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "File",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/file/addtoproject"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/file/delete",
    "title": "Delete data",
    "name": "delete",
    "group": "File",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "file_id",
            "description": "<p>File id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Upload Status JSON</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"success\": true,\n  \"err\": {}\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>file_id does not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>database_name or table_name does not exist in file.data.postgis or file_id doesn't exist in file.data.raster (404)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Internal_server_error",
            "description": "<p>Problems with drop table (500)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['file_id']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 500: Internal server error\n{\n   \"error\": {\n\t\t\"message\": \"Can't drop table tableName\",\n\t\t\"code\": \"500\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such file.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "File",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/file/delete"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/file/getLayers",
    "title": "Get layers",
    "name": "getLayers",
    "group": "File",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Type of file(raster or postgis)</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Object with file_id field for raster files or database_name and table_name for postgis files</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "array",
            "description": "<p>of layers</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n  {\n\t  uuid: 'layer uuid',\n\t  title: 'layer title',\n\t  description: 'layer description',\n\t  ... etc\n  }\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Missing",
            "description": "<p>required fields. (422)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 422: Missing type parameter or database_name and table_name for postgis type\n{\n   \"error\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 422: Missing file_id for rater type\n{\n   \"error\": \"request body should contains data.file_id\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "File",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/file/getLayers"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/dataset/share",
    "title": "Share dataset",
    "name": "shareDataset",
    "group": "File",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "dataset",
            "description": "<p>File id</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "users",
            "description": "<p>Array of user's ids</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "err",
            "description": "<p>Error object</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "file_shared",
            "description": "<p>File shared object</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "users_shared_with",
            "description": "<p>Shared users</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n err: null\n success: true,\n file_shared: {\n\tfile_name: 'fileName',\n\tfile_uuid: 'fileUuid',\n }\n users_shared_with : ['userId']\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>dataset or users do not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>file does not exist (404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['users', 'dataset']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such file.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "File",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/dataset/share"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/file/update",
    "title": "Update a file",
    "name": "update",
    "group": "File",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "uuid",
            "description": "<p>Uuid of file</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "updated",
            "description": "<p>Array of updated fields</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "file",
            "description": "<p>Updated file</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"updated\": ['name', 'description'],\n  \"file\": {\n      lastUpdated: '2016-01-19T12:49:49.076Z',\n      created: '2016-01-19T12:49:48.943Z',\n      ... etc\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "File",
            "description": "<p>with uuid <code>uuid</code> doesn't exist. (422)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 422: File doesn't exist\n{\n   \"error\": \"bad file uuid\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "File",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/file/update"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/geo/json2carto",
    "title": "Return carto css",
    "name": "json2carto",
    "group": "Geo",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "style",
            "description": "<p>Style object parameter</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "cartoCss",
            "description": "<p>Carto css</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "\"@polygon_opacity: 1;\n#layer {\n\n\tpolygon-opacity: @polygon_opacity;\n\n\tpolygon-fill: red;\n\n}\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>uuid does not exist in request body (400)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing style!\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['style']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Geo",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/geo/json2carto"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/layers/new",
    "title": "Create layer",
    "name": "create",
    "group": "Layer",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title of new layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description of new layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "legend",
            "description": "<p>Legend of new legend</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "file",
            "description": "<p>File of new layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "metadata",
            "description": "<p>Metadata of new layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data",
            "description": "<p>Data of new layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>Style of new layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "Layer",
            "description": "<p>New Layer object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   __v: 0,\n   lastUpdated: '2016-01-20T10:55:30.983Z',\n   created: '2016-01-20T10:55:30.983Z',\n   legend: '',\n   description: 'new layer description',\n   title: 'new layer title',\n   uuid: 'layer-ae4fc38c-58f0-4468-81e7-7330d226dc24',\n   _id: '569f67a2ebb7233b667d8a02'\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Layer",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/layers/new"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/layers/delete",
    "title": "Delete data",
    "name": "delete",
    "group": "Layer",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "layer_id",
            "description": "<p>Layer id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project__id",
            "description": "<p>Project id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Upload Status JSON</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"success\": true,\n  \"err\": {}\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>layer_id or project_id does not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>Layer with specific id not found(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['layer_id', 'project_id']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such layers\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such project.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Layer",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/layers/delete"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/layers",
    "title": "Get layers related with project",
    "name": "get_layers_by_project_id",
    "group": "Layer",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project",
            "description": "<p>Project uuid</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "layers",
            "description": "<p>Array of layers related with project</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[{\n   data: [Object],\n   __v: 0,\n   uuid: 'relatedLayerUuid',\n   title: 'relatedLayerTitle',\n   description: 'relatedLayerDescription',\n   created: Mon Jan 25 2016 11: 37: 44 GMT + 0000(UTC),\n   lastUpdated: Mon Jan 25 2016 11: 37: 44 GMT + 0000(UTC),\n   _id: 56 a60908fdce40a15eca6773\n}, and etc]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>project does not exist in request body (400)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['project']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Layer",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/layers"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/layer/update",
    "title": "Update layer",
    "name": "update",
    "group": "Layer",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "layer",
            "description": "<p>uuid of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>New title of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>New description of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "satellite_position",
            "description": "<p>New satellite_position of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "copyright",
            "description": "<p>New copyright of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tooltip",
            "description": "<p>New tooltip of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "style",
            "description": "<p>New style of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filter",
            "description": "<p>New filter of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "legends",
            "description": "<p>New legends of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "opacity",
            "description": "<p>New opacity of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zIndex",
            "description": "<p>New zIndex of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>New data of updated layer</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "response",
            "description": "<p>Update info</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "'save done'",
          "type": "String"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Missing",
            "description": "<p>required fields. (422)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 422: Missing layer parameter or layer with such id doesn't exist\n{\n   \"error\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Layer",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/layer/update"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/project/addInvites",
    "title": "Add invites",
    "name": "add_invites",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project",
            "description": "<p>Uuid of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "access",
            "description": "<p>Access object</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "access",
            "description": "<p>Project access object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n read: ['test'],\n edit: ['uuid-mocha-test-project'],\n options: {\n   share: true,\n   download: false,\n   isPublic: false\n }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>access or project do not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If project doesn't exist(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['access', 'project']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such project.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/addInvites"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/project/create",
    "title": "Create a project",
    "name": "create",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "Project",
            "description": "<p>JSON object of the newly created project</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>name doesn't exist in request body (400)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['name']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/create"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/project/delete",
    "title": "Delete a project",
    "name": "delete",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project_id",
            "description": "<p>Uuid of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "project",
            "description": "<p>ID of deleted project</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "deleted",
            "description": "<p>True if successful</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"project\": \"project-o121l2m-12d12dlk-addasml\",\n  \"deleted\": true\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>project_id doesn't exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If project doesn't exist(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['project_id']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such project.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/delete"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/project/get/public",
    "title": "Get a public project",
    "name": "get_public_project",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project_slug",
            "description": "<p>Project slug</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "JSON",
            "optional": false,
            "field": "Project",
            "description": "<p>JSON object of the newly created project</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n _id: '56af8403c608bbce6616d291',\n lastUpdated: '2016-02-01T16:12:51.390Z',\n created: '2016-02-01T16:12:51.390Z',\n createdBy: 'uuid-mocha-test-project',\n uuid: 'uuid-mocha-test-project_public',\n etc..\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>username or project_slug don't exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If user with specific username doesn't exist(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['username', 'project_slug']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such user.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such project.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Not a public project.\",\n\t\t\"code\": \"400\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/get/public"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/project/unique",
    "title": "Unique project",
    "name": "unique",
    "group": "Project",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "unique",
            "description": "<p>Project access object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  updated: ['logo', 'header', etc...],\n  project: {\n   _id: '56af0e566f8ca08221ee2ca7',\n   lastUpdated: '2016-02-01T07:50:46.730Z',\n   created: '2016-02-01T07:50:46.726Z',\n\t etc...\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/unique"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    }
  },
  {
    "type": "post",
    "url": "/api/project/update",
    "title": "Update project",
    "name": "update",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project_id",
            "description": "<p>Uuid of project which should be update</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "logo",
            "description": "<p>New logo of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "header",
            "description": "<p>New header of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "baseLayers",
            "description": "<p>New baseLayers of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "position",
            "description": "<p>New position of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "bounds",
            "description": "<p>New bounds of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "layermenu",
            "description": "<p>New layermenu of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "folders",
            "description": "<p>New folders of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "controls",
            "description": "<p>New controls of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>New description of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "keywords",
            "description": "<p>New keywords of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "colorTheme",
            "description": "<p>New colorTheme of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>New title of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "slug",
            "description": "<p>New slug of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "connectedAccounts",
            "description": "<p>New connectedAccounts of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "settings",
            "description": "<p>New settings of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "categories",
            "description": "<p>New categories of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "thumbCreated",
            "description": "<p>New thumbCreated of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "state",
            "description": "<p>New state of project</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "pending",
            "description": "<p>New pending of project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "access",
            "description": "<p>Project access object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  updated: ['logo', 'header', etc...],\n  project: {\n   _id: '56af0e566f8ca08221ee2ca7',\n   lastUpdated: '2016-02-01T07:50:46.730Z',\n   created: '2016-02-01T07:50:46.726Z',\n\t etc...\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>project_id doesn't not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If project doesn't exist(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['project_id']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such project.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"No access.\",\n\t\t\"code\": \"400\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/update"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/upload/get",
    "title": "Get upload",
    "name": "get_upload",
    "group": "Upload",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "file_id",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "file",
            "description": "<p>Upload file</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "layer",
            "description": "<p>Related layer</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "project",
            "description": "<p>Related project</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n file: {\n   _id: '56af0e566f8ca08221ee2ca7',\n   lastUpdated: '2016-02-01T07:50:46.730Z',\n   created: '2016-02-01T07:50:46.726Z',\n   dataSize: '109770',\n   type: 'postgis',\n   originalName: 'shapefile.zip',\n   name: 'shapefile',\n   createdBy: 'uuid-mocha-test-project',\n   uuid: 'file_tzcqhdaecyhmqraulgby',\n   __v: 0,\n   access: {\n     clients: [],\n     projects: [],\n     users: []\n   },\n   data: {\n     image: [Object],\n     postgis: [Object]\n   },\n   format: [],\n   keywords: [],\n   files: []\n },\n layer: null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>file_id do not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If file doesn't upload(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['file_id']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"no such upload status id\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Upload",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/upload/get"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/token",
    "title": "Get access token",
    "name": "access_token",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Email or username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "refresh",
            "defaultValue": "false",
            "description": "<p>Refresh access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Access token JSON</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\t\"access_token\":\"AMduTdFBlXcBc1PKS5Ot4MZzwGjPhKw3y2LzJwJ0CGz0lpRGhK5xHGMcGLqvrOfY1aBR4M9Y4O126WRr5YSQGNZoLPbN0EXMwlRD0ajCqsd4MRr55UpfVYAfrLRL9i0tuglrtGYVs2iT8bl75ZVfYnbDl4Vjp4ElQoWqf6XdqMsIr25XxO5cZB9NRRl3mxA8gWRzCd5bvgZFZTWa6Htx5ugRqwWiudc8lbWNDCx85ms1up94HLKrQXoGMC8FVgf4\",\n\t\"expires_in\":\"36000\",\n\t\"token_type\":\"Bearer\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Missing or invalid information.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n    \"error\": \"Please provide username/email and password.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/token"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/token/check",
    "title": "Check access token",
    "name": "check_access_token",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Access token JSON</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/token/check"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (403)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/api/token/check",
    "title": "Check access token",
    "name": "check_access_token",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Valid status</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\t\"valid\" : true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/token/check"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (403)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/portal",
    "title": "Get portal store",
    "name": "getPortal",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "Projects",
            "description": "<p>Projects that user have access to</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "Datasets",
            "description": "<p>Datasets that user owns or have access to</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "Contacts",
            "description": "<p>Contacts that user has in contact list</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/portal"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (403)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/api/user/info",
    "title": "Get info on authenticated user",
    "name": "info",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>User</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"user\": {\n      lastUpdated: '2016-01-19T12:49:49.076Z',\n      created: '2016-01-19T12:49:48.943Z',\n      ... etc\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/user/info"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    }
  },
  {
    "type": "post",
    "url": "/api/token/refresh",
    "title": "Refresh access token",
    "name": "refresh_access_token",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "status",
            "description": "<p>Access token JSON</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\t\"access_token\":\"AMduTdFBlXcBc1PKS5Ot4MZzwGjPhKw3y2LzJwJ0CGz0lpRGhK5xHGMcGLqvrOfY1aBR4M9Y4O126WRr5YSQGNZoLPbN0EXMwlRD0ajCqsd4MRr55UpfVYAfrLRL9i0tuglrtGYVs2iT8bl75ZVfYnbDl4Vjp4ElQoWqf6XdqMsIr25XxO5cZB9NRRl3mxA8gWRzCd5bvgZFZTWa6Htx5ugRqwWiudc8lbWNDCx85ms1up94HLKrQXoGMC8FVgf4\",\n\t\"expires_in\":\"36000\",\n\t\"token_type\":\"Bearer\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/token/refresh"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (403)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/reset/password",
    "title": "Reset password",
    "name": "reset_password",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>New password</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Moved Temporarily. Redirecting to /</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>password or token do not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If file doesn't upload(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['token', 'password']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Invalid token\n{\n   \"error\": {\n\t\t\"message\": \"Invalid access token.\",\n\t\t\"code\": \"401\"\n\t}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/reset/password"
      }
    ]
  },
  {
    "type": "post",
    "url": "/reset",
    "title": "Send reset password mail",
    "name": "send_reset_password_mail",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Please check your email for password reset link.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>Email does not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If user with specific email doesn't exist(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['email']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: User not found\n{\n   \"error\": {\n\t\t\"message\": \"No such user.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/reset"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/user/update",
    "title": "Update user",
    "name": "update",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "uuid",
            "description": "<p>Uuid of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>A valid access token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "updated",
            "description": "<p>Array of updated fields</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>Updated user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"updated\": ['phone', 'company'],\n  \"user\": {\n      lastUpdated: '2016-01-19T12:49:49.076Z',\n      created: '2016-01-19T12:49:48.943Z',\n      ... etc\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>The <code>access_token</code> is invalid. (401)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Bad_request",
            "description": "<p>uuid does not exist in request body (400)</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Not_found",
            "description": "<p>If user doesn't exist(404)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"Missing information. Check out https://docs.systemapic.com/ for details on the API.\",\n\t\t\"code\": \"400\",\n\t\t\"errors\": {\n\t\t\t\"missingRequiredFields\": ['uuid']\n\t\t}\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 400: Bad request\n{\n   \"error\": {\n\t\t\"message\": \"No access.\",\n\t\t\"code\": \"400\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 404: Not found\n{\n   \"error\": {\n\t\t\"message\": \"No such user.\",\n\t\t\"code\": \"404\"\n\t}\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "Error 401: Unauthorized\n{\n   \"error\": \"Invalid access token.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/user/update"
      }
    ]
  },
  {
    "type": "post",
    "url": "/api/user/session",
    "title": "Check if already logged in (browser-only)",
    "name": "user_session",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "access_token",
            "description": "<p>Valid access token (either user or public)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/user/session"
      }
    ]
  }
] });
