const autoBind = require('auto-bind');

class UmkmsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postUmkmHandler(request, h) {
    this._validator.validateUmkmPayload(request.payload);
    const {
      name, description, subdistrict, address, year, rating, cover_url = null,
    } = request.payload;
    const credentialId = request.auth.credentials.id;

    const umkmId = await this._service.addUmkm({
      name, description, subdistrict, address, year, rating, cover_url, credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Umkm berhasil ditambahkan',
      data: {
        umkmId,
      },
    });
    response.code(201);
    return response;
  }

  async getUmkmsHandler() {
    const umkms = await this._service.getAllUmkms();
    return {
      status: 'success',
      data: {
        umkms,
      },
    };
  }

  async getUmkmByIdHandler(request) {
    const { id } = request.params;
    const umkm = await this._service.getUmkmById(id);
    return {
      status: 'success',
      data: {
        umkm,
      },
    };
  }

  async putUmkmByIdHandler(request) {
    this._validator.validateUmkmPayload(request.payload);
    const { id } = request.params;

    await this._service.editUmkmById(id, request.payload);

    return {
      status: 'success',
      message: 'Umkm berhasil diperbarui',
    };
  }

  async deleteUmkmByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteUmkmById(id);

    return {
      status: 'success',
      message: 'Umkm berhasil dihapus',
    };
  }

  async postUmkmCoverHandler(request, h) {
    const { id: umkmId } = request.params;
    const { cover_url } = request.payload;

    this._validator.validateImageHeaders(cover_url.hapi.headers);

    const filename = await this._storageService.writeFile(cover_url, cover_url.hapi);
    const path = `http://${process.env.HOST}:${process.env.PORT}/umkms/images/${filename}`;

    await this._service.editUmkmCoverById(umkmId, { path });

    const response = h.response({
      status: 'success',
      message: 'Cover Umkm berhasil diubah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UmkmsHandler;
