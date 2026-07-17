namespace Inventory.Domain.Entities;

public enum MovementType
{
    Purchase = 1,
    Sale = 2,
    TransferIn = 3,
    TransferOut = 4,
    Adjustment = 5,
    Return = 6
}