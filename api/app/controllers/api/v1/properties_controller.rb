# frozen_string_literal: true

module Api
  module V1
    class PropertiesController < Api::V1::BaseController
      include Pagy::Backend
      include PagyCursorable

      skip_before_action :authenticate_user, only: %i[index show]
      before_action :set_property, only: %i[show update destroy]

      MAX_LIMIT = 100
      DEFAULT_LIMIT = 25

      # GET /api/v1/properties
      def index
        requested_limit = params[:limit].to_i
        requested_limit = DEFAULT_LIMIT if requested_limit <= 0
        limit = [requested_limit, MAX_LIMIT].min

        relation = Property.includes(:property_images)
                           .order(:id)
                           .property_type(params[:property_type])
                           .between_bedrooms(params[:min_bedrooms], params[:max_bedrooms])
                           .between_price(params[:min_price], params[:max_price])

        if params[:cursor].present?
          cursor_id = params[:cursor].to_i
          relation = relation.where('id > ?', cursor_id)
        end

        @pagy, @properties = pagy(relation, items: limit)

        metadata = {
          limit: limit
        }

        if @properties.count == limit
          last_property = @properties.last
          more_exist = relation.exists?(['id > ?', last_property.id])
          metadata[:next_cursor] = last_property.id.to_s if more_exist
        end

        properties_array = @properties.map do |property|
          property.as_json(
            include: {
              property_images: { only: [:id, :url, :position] }
            },
            methods: [:formatted_price]
          )
        end

        render json: {
          properties: properties_array,
          metadata: metadata
        }, status: :ok
      end

      # GET /api/v1/properties/:id
      def show
        render json: @property.as_json(
          include: {
            property_images: { only: [:id, :url, :position] }
          },
          methods: [:formatted_price]
        ), status: :ok
      end

      # POST /api/v1/properties
      def create
        @property = Property.new(property_params)
        if @property.save
          render json: @property.as_json(
            include: {
              property_images: { only: [:id, :url, :position] }
            },
            methods: [:formatted_price]
          ), status: :created
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/properties/:id
      def update
        if @property.update(property_params)
          render json: @property.as_json(
            include: {
              property_images: { only: [:id, :url, :position] }
            },
            methods: [:formatted_price]
          ), status: :ok
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/properties/:id
      def destroy
        @property.destroy
        head :no_content
      end

      private

      def set_property
        @property = Property.find(params[:id])
      end

      def property_params
        params.require(:property).permit(
          :title,
          :description,
          :price,
          :bedrooms,
          :property_type,
          :status,
          :latitude,
          :longitude
        )
      end
    end
  end
end
