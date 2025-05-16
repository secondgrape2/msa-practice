# Event Service

## 엔티티 관계도 (ERD)

```mermaid
erDiagram
    GameEvent {
        ObjectId _id PK
        string name
        string description
        string conditionsDescription
        string conditionType
        object conditionConfig
        date startDate
        date endDate
        boolean isActive
        date createdAt
        date updatedAt
    }

    Reward {
        ObjectId _id PK
        ObjectId eventId FK
        string type
        string name
        string description
        number quantity
        object details
        date createdAt
        date updatedAt
    }

    GameEvent ||--o{ Reward : "has"
```

## 엔티티 상세 설명

### GameEvent (게임 이벤트)

- `_id`: 고유 식별자 (MongoDB ObjectId)
- `name`: 이벤트 이름 (인덱스 적용)
- `description`: 이벤트 상세 설명
- `conditionsDescription`: 이벤트 조건에 대한 사람이 읽을 수 있는 설명
- `conditionType`: 이벤트 유형 분류 (인덱스 적용)
- `conditionConfig`: 이벤트 조건 설정
  - 복합 조건 또는 기본 조건 배열로 구성 가능
  - 복합 조건 구조:
    ```typescript
    {
      operator: 'AND' | 'OR',
      rules: [
        { type: string, params: Record<string, unknown> }
      ]
    }
    ```
- `startDate`: 이벤트 시작일
- `endDate`: 이벤트 종료일
- `isActive`: 현재 활성화 상태 여부 (인덱스 적용)
- `createdAt`: 생성 시간
- `updatedAt`: 마지막 수정 시간

### Reward (보상)

- `_id`: 고유 식별자 (MongoDB ObjectId)
- `eventId`: 연관된 게임 이벤트 참조 (인덱스 적용)
- `type`: 보상 유형 (enum: 'point', 'item', 'coupon')
- `name`: 보상 이름
- `description`: 선택적 상세 설명
- `quantity`: 획득 가능한 횟수
- `details`: 보상 유형별 상세 정보
  - 포인트 보상:
    ```typescript
    {
      pointAmount: number,
      expiryDate?: Date
    }
    ```
  - 아이템 보상:
    ```typescript
    {
      itemId: string,
      itemName: string,
      itemQuantity: number
    }
    ```
  - 쿠폰 보상:
    ```typescript
    {
      couponCode: string,
      discountAmount: number,
      discountType: 'percentage' | 'fixed',
      minimumPurchaseAmount?: number,
      expiryDate?: Date
    }
    ```
- `createdAt`: 생성 시간
- `updatedAt`: 마지막 수정 시간
