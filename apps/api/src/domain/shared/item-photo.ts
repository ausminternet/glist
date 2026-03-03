export class ItemPhoto {
  constructor(
    public readonly id: string,
    public readonly photoKey: string,
    public readonly createdAt: Date,
  ) {}

  static create(photoKey: string): ItemPhoto {
    return new ItemPhoto(crypto.randomUUID(), photoKey, new Date())
  }
}
