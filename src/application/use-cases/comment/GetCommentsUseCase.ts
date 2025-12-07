import { CommentModel } from "@infrastructure/database/models/CommentModel";

export class GetCommentsUseCase {
  async execute(
    entityType: string,
    entityId: string,
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } = await CommentModel.findAndCountAll({
      where: {
        entityType,
        entityId,
        parentId: null, // Only top-level comments
      },
      include: [
        {
          model: CommentModel,
          as: "replies",
          include: ["author"],
        },
        "author",
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { comments: rows, total: count };
  }
}
