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
    "url": "/api/data/delete",
    "title": "Delete data",
    "name": "delete_data",
    "group": "Data",
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
          "content": "{\n \"success\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Data",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/data/delete"
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
    "url": "/api/project/get",
    "title": "Get a project",
    "name": "create",
    "group": "Project",
    "description": "<p>Can get project <em>either</em> by <code>project_id</code> OR <code>username, project_slug</code></p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "project_id",
            "description": "<p>Id project</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "project_slug",
            "description": "<p>Project slug (shortname in url)</p>"
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
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/get"
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
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/create"
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
            "field": "projectUuid",
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
    "version": "0.0.0",
    "filename": "routes/routes.js",
    "groupTitle": "Project",
    "sampleRequest": [
      {
        "url": "https://dev.systemapic.com/api/project/delete"
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
