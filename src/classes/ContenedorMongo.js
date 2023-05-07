class ContenedorMongo {
    constructor(model) {
        this.model = model;
    }

    async getAll() {
        try {
            const response = await this.model.find().lean();

            return response;
        } catch (err) {
            throw new Error("Error getting resources");
        }
    }

    async getById(id) {
        try {
            const response = await this.model.findById(id);

            return response;
        } catch (err) {
            console.log("Error getting resources");
        }
    }

    async save(resource) {
        try {
            const response = await this.model.create(resource);
            return response;
        } catch (err) {
            throw new Error("Error saving document");
        }
    }

    async update(id, resource) {
        try {
            const response = await this.model.findByIdAndUpdate(id, resource);

            return response;
        } catch (err) {
            throw new Error("Error getting resources");
        }
    }

    async delete(id) {
        try {
            const response = await this.model.findByIdAndDelete(id);

            return response;
        } catch (err) {
            throw new Error("Error getting resources");
        }
    }
}

export default ContenedorMongo;