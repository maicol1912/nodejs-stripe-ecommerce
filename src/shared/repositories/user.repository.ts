import { InjectModel } from "@nestjs/mongoose";
import { User } from "../schema/user";
import { Model } from "mongoose"
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    }

    async findOne(query: any) {
        return await this.userModel.findOne(query)
    }

    async findAll(query: any) {
        return await this.userModel.find(query)
    }

    async create(data: Record<string, any>) {
        return await this.userModel.create(data)
    }

    async updateOne(query: any, data: Record<string, any>) {
        return await this.userModel.updateOne(query, data)
    }

    async findById(id: string) {
        return await this.userModel.findById(id)
    }
}