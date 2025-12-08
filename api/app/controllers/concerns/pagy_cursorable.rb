# frozen_string_literal: true

module PagyCursorable
  extend ActiveSupport::Concern
  include Pagy::Backend

  DEFAULT_LIMIT = 25
  MAX_LIMIT = 100

  def paginate_cursor(relation, limit: nil, cursor_params: :cursor)
    limit ||= params[:limit]&.to_i || DEFAULT_LIMIT
    limit = MAX_LIMIT if limit > MAX_LIMIT

    pagy, records = pagy_cursor(
      relation,
      items: limit,
      after: params[cursor_params]
    )

    [pagy, records]
  end
end
