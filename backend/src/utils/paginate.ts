export class Paginate {
  static builder() {
    class Builder {
      private data: unknown[] = [];
      private total!: number;
      private params!: { limit: string; page: string };

      setData(data: unknown[]) {
        this.data = data;
        return this;
      }

      setQueryParams({ limit, page }: { limit?: string; page?: string }) {
        if (limit && page) {
          this.params = { limit, page };
        } else {
          this.params = { limit: '10', page: '1' };
        }

        return this;
      }

      setTotal(total: number) {
        this.total = total;

        return this;
      }

      build() {
        if (this.data === undefined) throw new Error("Please chain on 'setData' method to paginate builder");
        if (this.total === undefined) throw new Error("Please chain on 'setTotal' method to paginate builder");
        if (this.params === undefined) throw new Error("Please chain on 'setQueryParams' method to paginate builder");
        const page = +(this.params.page || 1);
        const limit = +(this.params.limit || 10);
        const totalPage = Math.ceil(this.total / limit);

        return {
          page_info: {
            total: this.total,
            limit: limit,
            page: page,
            pages_count: totalPage,
            has_next_page: page < totalPage && totalPage > 1,
            has_prev_page: page > 1 && page <= totalPage,
          },
          nodes: this.data,
        };
      }
    }

    return new Builder();
  }
}
